import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import { RichText } from 'prismic-dom'
import { Document } from '@prismicio/client/types/documents'

import { getPrismicClient } from '../../../services/prismic'

import styles from '../slug.module.scss'
import Link from 'next/link'

interface IPrismicData {
  type: string
  text: string
  spans: Array<any>
}

interface IPrismicResponseData {
  title: Array<IPrismicData>
  content: Array<IPrismicData>
}

interface IPostPreviewProps {
  post: {
    slug: string
    title: string
    content: string
    updatedAt: string
  }
}

export default function PostPreview({ post }: IPostPreviewProps) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session])

  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div
            className={`${styles.content} ${styles.contentPreview}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Do you want to continue reading?
            <Link href="/">
              <a>Subscribe now! 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

/** This method is responsable for creating STATIC PAGES when the application
  BUILDING is generated. So, we can specify the URLS which we want generate static.
  All the others URLS out of this method will be generate on the first access.
  It is important to keep in mind that, only pages with parameters ([param].tsx)
  are able to gerenerate STATIC PAGES. The pages that does not receive parameters
  will be generated as static by default.

  fallback as true
  When the page content was not generate yet (theres is not a static page),
  The page will be generate on the browser. It can cause two main problems:
  layout shift and bad SEO optmization.

  fallback as false
  When the page content was not generate as static for the first time, the
  applicaton will return a status code 404, nothing else. Usually used when a
  page is static forever.

  fallback as blocking
  Generate the page content using server side redering
 */
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: { slug: 'jamstack-geleia-de-javascript-api-e-markup' }
      }
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient()

  const response: Document<IPrismicResponseData> = await prismic.getByUID(
    'post',
    String(slug),
    {}
  )

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 4)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
      }
    )
  }

  return {
    props: { post },
    revalidate: 60 * 60 // 60sec * 60 = 1hour
  }
}
