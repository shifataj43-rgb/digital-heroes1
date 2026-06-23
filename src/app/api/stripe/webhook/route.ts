import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    if (!webhookSecret) {
      // In dev mode without a secret, just parse it unverified
      event = JSON.parse(body) as Stripe.Event
    } else {
      // Verify signature to ensure it's from Stripe
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const adminSupabase = await getAdminClient()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      const customerId = session.customer as string
      const isDonation = session.metadata?.isDonation === 'true'

      if (userId) {
        const amount = session.amount_total ? session.amount_total / 100 : 0
        const currency = session.currency?.toUpperCase() || 'USD'

        if (isDonation) {
          // Process One-Time Donation
          const charityName = session.metadata?.charityName || 'Unknown Charity'
          
          await adminSupabase.from('payments').insert({
            user_id: userId,
            amount: amount,
            currency: currency,
            payment_provider: 'stripe_donation',
            status: 'success'
          })
          
          console.log(`Processed one-time donation of ${amount} ${currency} to ${charityName} from user ${userId}`)
        } else {
          // Process Subscription
          const planType = session.metadata?.planType || 'monthly'

          // 1. Activate their subscription status
          await adminSupabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('id', userId)

          // 2. Log the Payment so the Admin Dashboard Revenue trackers work
          await adminSupabase.from('payments').insert({
            user_id: userId,
            amount: amount,
            currency: currency,
            payment_provider: 'stripe',
            status: 'success'
          })

          // 3. Log the Subscription timeframe
          const startDate = new Date()
          const endDate = new Date()
          if (planType === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1)
          else endDate.setMonth(endDate.getMonth() + 1)

          await adminSupabase.from('subscriptions').insert({
            user_id: userId,
            plan: planType,
            plan_type: planType,
            amount: amount,
            currency: currency,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: 'active'
          })
          
          console.log(`Fully activated and recorded subscription for user ${userId}`)
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      // Note: We don't have the user ID easily accessible here unless we saved `stripe_subscription_id`
      // on the profile. For a robust production app, you'd look up the user by customer ID.
      // For this implementation, since we only have `subscription_status` on the profile,
      // cancellation will mostly happen via the Dashboard UI setting it directly, or
      // if you add `stripe_customer_id` to profiles.
      console.log(`Subscription deleted: ${subscription.id}`)
      break
    }
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
