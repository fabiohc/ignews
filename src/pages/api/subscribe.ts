import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { stripe } from '../../services/stripe'
import { query as q } from 'faunadb'

import { fauna } from '../../services/fauna'

interface IFaunaUserData {
  ref: {
    id: string
  }
  data: {
    email: string
    stripe_customer_id: string
  }
}

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    // Getting info from logged user by COOCKIES on browser
    const session = await getSession({ req: request })

    // Finding user on Fauna
    const userOnFauna = await fauna.query<IFaunaUserData>(
      q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user.email)))
    )

    let customerId = userOnFauna.data.stripe_customer_id

    if (!customerId) {
      // Creating a new user on stripe
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email
      })

      // Updating user on Fauna with a new data, stripe_customer_id
      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), userOnFauna.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id
          }
        })
      )

      customerId = stripeCustomer.id
    }

    // Creating a new subscription on stripe
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: process.env.STRIPE_SUBSCRIPTION_PRICE, quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_CHECKOUT_URL,
      cancel_url: process.env.STRIPE_CANCEL_CHECKOUT_URL
    })

    return response.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    response.setHeader('Allow', 'POST')
    response.status(405).end('Method not allowed')
  }
}
