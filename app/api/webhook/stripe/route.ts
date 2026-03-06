import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(body, sig, webhookSecret)
      : JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const userId = session.metadata?.user_id
    const planId = session.metadata?.plan_id
    if (!userId || !planId) return NextResponse.json({ received: true })

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    await supabase.from('berzosa_subscriptions').upsert({
      user_id: userId,
      plan: planId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.user_id
    if (!userId) return NextResponse.json({ received: true })

    await supabase.from('berzosa_subscriptions').update({
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}
