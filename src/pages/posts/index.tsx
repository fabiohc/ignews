import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse'
import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic'

import styles from './posts.module.scss'

interface IPrismicData {
  type: string
  text: string
  spans: Array<any>
}

interface IPrismicResponseData {
  title: Array<IPrismicData>
  content: Array<IPrismicData>
}

interface IPostsData {
  slug: string
  title: string
  excerpt: string
  updatedAt: string
}

interface IPostsProps {
  posts: Array<IPostsData>
}

export default function Posts({ posts }: IPostsProps) {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(({ slug, title, excerpt, updatedAt }) => (
            <Link key={slug} href={`/posts/${slug}`}>
              <a>
                <time>{updatedAt}</time>
                <strong>{title}</strong>
                <p>{excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const client = getPrismicClient()

  const response: ApiSearchResponse<IPrismicResponseData> = await client.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.content'],
      pageSize: 100
    }
  )

  const posts = response.results.map(post => ({
    slug: post.uid,
    title: RichText.asText(post.data.title),
    excerpt:
      post.data.content.find(content => content.type === 'paragraph')?.text ??
      '',
    updatedAt: new Date(post.last_publication_date).toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
      }
    )
  }))

  return {
    props: { posts }
  }
}
