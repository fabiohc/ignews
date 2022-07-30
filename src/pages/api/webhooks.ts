/**
 * To listen the Stripe webhooks on localhost, first install the Stripe CLI, then
 * $ stripe listen --forward-to localhost:3000/api/webhooks
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'
import Stripe from 'stripe'

import { stripe } from '../../services/stripe'
import { manageSubscriptions } from './_lib/manageSubscriptions'

// Config to enable streams reading
export const config = {
  api: {
    bodyParser: false
  }
}

// Method to read streams
async function buffer(readble: Readable) {
  const chunks = []

  for await (const chunk of readble) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}
/**
  checkout.session.completed and customer.subscription.created are responsible
  for creating a new data on collection. When the only way to subscribe our
  product is through the website, customer.subscription.created can be ommited.
  In the present case, we chosed to keep the customer.subscription.created,
  treating duplications on faunadb query inside manageSubscriptions method
 */

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const buff = await buffer(request)
    const stripeSignature = request.headers['stripe-signature']

    let stripeEvent: Stripe.Event

    try {
      stripeEvent = stripe.webhooks.constructEvent(
        buff,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return response.status(400).send(`Webhook error: ${err.message}`)
    }

    const { type } = stripeEvent

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = stripeEvent.data.object as Stripe.Subscription

            await manageSubscriptions({
              subscriptionId: subscription.id,
              customerId: subscription.customer.toString(),
              createAction: type === 'customer.subscription.created'
            })

            break

          case 'checkout.session.completed':
            const checkoutSession = stripeEvent.data
              .object as Stripe.Checkout.Session

            await manageSubscriptions({
              subscriptionId: checkoutSession.subscription.toString(),
              customerId: checkoutSession.customer.toString(),
              createAction: true
            })

            break

          default:
            throw new Error('Unhandled Stripe event.')
        }
      } catch (err) {
        /** This response will be send to Stripe, if we put an error status code
        here, the Stripe API will understand the request as failed, then, a new
        webhook will be sent to us, many times */
        return response.json({ error: 'Webhook handle failed.' })
      }
    }

    response.json({ received: true })
  } else {
    response.setHeader('Allow', 'POST')
    response.status(405).end('Method not allowed')
  }
}
