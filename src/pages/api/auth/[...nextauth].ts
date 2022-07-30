import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { query as q } from 'faunadb'

import { fauna } from '../../../services/fauna'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_AUTH_GITHUB_ID,
      clientSecret: process.env.NEXT_AUTH_GITHUB_SECRET,

      authorization: {
        params: {
          scope: 'read:user'
        }
      }
    })
  ],

  callbacks: {
    async session({ session }) {
      /** When fauna query does not find any data, it throws an error by default,
        then we always need to put the query inside a try cath block, to treat
        the error in best way */
      try {
        const userHasAnActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  'ref',
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index('subscription_by_status'), 'active')
            ])
          )
        )

        return {
          ...session,
          activeSubscription: userHasAnActiveSubscription
        }
      } catch (err) {
        return {
          ...session,
          activeSubscription: null
        }
      }
    },
    async signIn({ user }) {
      const { email } = user

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(q.Match(q.Index('user_by_email'), q.Casefold(email)))
            ),
            q.Create(q.Collection('users'), { data: { email } }),
            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(email)))
          )
        )

        return true
      } catch {
        return false
      }
    }
  }
})
