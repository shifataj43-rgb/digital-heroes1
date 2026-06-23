import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Define the route configuration inside the file, NOT exporting config
export const maxDuration = 30; // Vercel function timeout
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId) {
        console.log(`Checkout completed for user ${userId}. Activating subscription...`)
        
        // Securely update the Supabase profile using Admin Client (bypassing RLS for system update)
        const adminSupabase = await getAdminClient()
        const { error } = await adminSupabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', userId)

        if (error) {
          console.error('Failed to update user profile in Supabase:', error)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
      }
      break;
    }
    case 'customer.subscription.deleted': {
      // Handle subscription cancellations
      const subscription = event.data.object as Stripe.Subscription
      // Note: We'd normally look up the userId by customer ID, but for this demo, 
      // we're primarily focused on the checkout session completed event.
      console.log('Subscription canceled:', subscription.id)
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
