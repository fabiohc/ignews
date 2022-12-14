import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { RichText } from 'prismic-dom'
import { Document } from '@prismicio/client/types/documents'

import { getPrismicClient } from '../../services/prismic'

import styles from './slug.module.scss'

interface IPrismicData {
  type: string
  text: string
  spans: Array<any>
}

interface IPrismicResponseData {
  title: Array<IPrismicData>
  content: Array<IPrismicData>
}

interface IPostProps {
  post: {
    slug: string
    title: string
    content: string
    updatedAt: string
  }
}

export default function Post({ post }: IPostProps) {
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
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params
}) => {
  const session = await getSession({ req })
  const { slug } = params
  const prismic = getPrismicClient()

  if (!session?.activeSubscription) {
    return {
      redirect: {
        permanent: false,
        destination: `/posts/preview/${slug}`
      }
    }
  }

  const response: Document<IPrismicResponseData> = await prismic.getByUID(
    'post',
    String(slug),
    {}
  )

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
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
    props: { post }
  }
}
