import Prismic from '@prismicio/client'

export function getPrismicClient() {
  return Prismic.client(process.env.PRISMIC_END_POINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  })
}
