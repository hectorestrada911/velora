import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerId, successUrl, cancelUrl } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Create or retrieve customer
    let customer: Stripe.Customer
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    } else {
      // Create new customer (you'd typically get email from auth context)
      customer = await stripe.customers.create({
        email: 'user@example.com', // Replace with actual user email
        metadata: {
          source: 'velora_web'
        }
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        customer_id: customer.id,
        source: 'velora_web'
      },
      subscription_data: {
        metadata: {
          customer_id: customer.id,
          source: 'velora_web'
        }
      }
    })

    return NextResponse.json({ sessionId: session.id, customerId: customer.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
