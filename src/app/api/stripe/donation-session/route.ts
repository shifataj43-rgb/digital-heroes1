import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

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

    const { charityName, amount, currency } = await req.json()

    if (!charityName || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create a dynamic Stripe Checkout Session for a one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      client_reference_id: user.id,
      metadata: { 
        isDonation: 'true',
        charityName: charityName
      },
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Donation to ${charityName}`,
              description: 'Independent one-time charity donation via Digital Heroes.',
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/charity?donation=success`,
      cancel_url: `${origin}/dashboard/charity?donation=canceled`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: any) {
    console.error('Error creating Stripe donation session:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
