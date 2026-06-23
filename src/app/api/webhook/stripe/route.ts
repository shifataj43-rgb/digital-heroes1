import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string

  let event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET is missing. Bypassing signature verification for local testing.')
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  const adminSupabase = await getAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const userId = session.metadata?.userId
      const subscriptionId = session.subscription

      if (userId) {
        console.log(`✅ Payment successful for user ${userId}. Activating subscription...`)
        await adminSupabase.from('profiles').update({
          subscription_status: 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId
        }).eq('id', userId)
      }
      break
    }
    
    case 'customer.subscription.deleted':
    case 'customer.subscription.canceled': {
      const subscription = event.data.object as any
      console.log(`❌ Subscription canceled: ${subscription.id}`)
      await adminSupabase.from('profiles').update({
        subscription_status: 'canceled'
      }).eq('stripe_subscription_id', subscription.id)
      break
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as any
      // If payment fails or is past due, we can update the status
      if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
        console.log(`⚠️ Subscription past due: ${subscription.id}`)
        await adminSupabase.from('profiles').update({
          subscription_status: 'inactive'
        }).eq('stripe_subscription_id', subscription.id)
      } else if (subscription.status === 'active') {
        await adminSupabase.from('profiles').update({
          subscription_status: 'active'
        }).eq('stripe_subscription_id', subscription.id)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
