import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Initialize Stripe (will fail gracefully if keys aren't set yet)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType, amount, currency } = await req.json()

    if (!planType || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Define the origin URL for redirect back
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create a dynamic Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      client_reference_id: user.id, // THIS is how we link the payment to our user in the webhook!
      metadata: { planType },
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Digital Heroes ${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`,
              description: 'Access to prize draws and charity contributions.',
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amounts in cents
            recurring: {
              interval: planType === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/billing?success=true`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
