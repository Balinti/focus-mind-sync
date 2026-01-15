import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  })

  return stripeInstance
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

export function hasProPriceId(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID)
}
