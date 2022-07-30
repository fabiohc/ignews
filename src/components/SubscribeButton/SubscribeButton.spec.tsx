import { render, screen, fireEvent } from '@testing-library/react'
import { signIn, useSession } from 'next-auth/react'
import { mocked } from 'jest-mock'
import { useRouter } from 'next/router'

import { SubscribeButton } from './index'

jest.mock('next-auth/react')
jest.mock('next/router')

describe('SUBSCRIBE BUTTON COMPONENT', () => {
  it('renders subscribe button correctly.', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated'
    })

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
  })

  it('redirects user to sign in when IS NOT authenticated.', () => {
    const useSessionMocked = mocked(useSession)
    const signInMocked = mocked(signIn)

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated'
    })

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  })

  it('redirects to posts when user already has an active subscription.', () => {
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

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(pushMocked).toHaveBeenCalledWith('/posts')
  })
})
