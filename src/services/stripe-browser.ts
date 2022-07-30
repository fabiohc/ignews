// Stripe-js SDK for frontend
import { loadStripe } from '@stripe/stripe-js'

export async function getStripeJS() {
  const stripeJs = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )

  return stripeJs
}
