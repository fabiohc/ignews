import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'

jest.mock('next-auth/react')
jest.mock('next/router')
jest.mock('../../services/prismic')

const post = {
  slug: 'my-new-post',
  title: 'My New Post',
  content: '<p>Post excerpt</p>',
  updatedAt: 'April 01, 2021'
}

describe('POST PREVIEW PAGE', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated'
    })

    render(<Post post={post} />)

    expect(screen.getByText('My New Post')).toBeInTheDocument()
    expect(screen.getByText('Post excerpt')).toBeInTheDocument()
    expect(
      screen.getByText('Do you want to continue reading?')
    ).toBeInTheDocument()
  })

  it('renders user to full post when use is subscribed', () => {
    const useSessionMocked = mocked(useSession)
    const useRouterMocked = mocked(useRouter)
    const pushMocked = jest.fn()

    const user = { name: 'John Doe', email: 'doe@gmail.com' }
    const expires = 'fake-expires'
    const activeSubscription = 'fake-active-subscription'

    useSessionMocked.mockReturnValueOnce({
      data: { user, expires, activeSubscription },
      status: 'authenticated'
    })

    useRouterMocked.mockImplementationOnce(() => ({ push: pushMocked } as any))

    render(<Post post={post} />)

    expect(pushMocked).toHaveBeenCalledWith('/posts/my-new-post')
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My New Post' }],
          content: [{ type: 'paragraph', text: 'Post excerpt' }]
        },
        last_publication_date: '04-01-2021'
      })
    } as any)

    const response = await getStaticProps({
      params: { slug: 'my-new-post' }
    })

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My New Post',
            content: '<p>Post excerpt</p>',
            updatedAt: 'April 01, 2021'
          }
        }
      })
    )
  })
})
