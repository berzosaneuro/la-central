'use server'

import Stripe from 'stripe'
import { PLANS } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

export async function createCheckoutSession(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const plan = PLANS.find(p => p.id === planId)
  if (!plan || plan.priceInCents === 0) throw new Error('Plan no válido')

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://webberzosaneuro.vercel.app'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `BerzosaNeuro ${plan.name}`,
            description: plan.description,
          },
          unit_amount: plan.priceInCents,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    customer_email: user.email,
    metadata: { user_id: user.id, plan_id: planId },
    success_url: `${origin}/dashboard?success=true&plan=${planId}`,
    cancel_url: `${origin}/precios`,
    ui_mode: 'hosted',
  })

  return { url: session.url }
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: sub } = await supabase
    .from('berzosa_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.stripe_customer_id) throw new Error('No hay suscripción activa')

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://webberzosaneuro.vercel.app'
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  })

  return { url: session.url }
}
