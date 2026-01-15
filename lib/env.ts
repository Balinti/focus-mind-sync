// Environment variable helpers with graceful fallbacks

export const env = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripeProPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
  stripeProYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export const isSupabaseConfigured = () => {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}

export const isStripeConfigured = () => {
  return Boolean(env.stripeSecretKey && env.stripePublishableKey)
}

export const hasStripePriceIds = () => {
  return Boolean(env.stripeProPriceId)
}
