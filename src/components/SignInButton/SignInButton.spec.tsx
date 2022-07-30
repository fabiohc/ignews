import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { mocked } from 'jest-mock'

import { SignInButton } from './index'

jest.mock('next-auth/react')

describe('SIGN IN BUTTON COMPONENT', () => {
  it('renders sign in button correctly when user IS NOT authenticated.', () => {
    const mockedUseSession = mocked(useSession)

    mockedUseSession.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated'
    })

    render(<SignInButton />)
    expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
  })

  it('renders sign in button correctly when user IS authenticated.', () => {
    const user = { name: 'Jonh Doe', email: 'j.doe@gmail.com' }
    const mockedUseSession = mocked(useSession)

    mockedUseSession.mockReturnValueOnce({
      data: { user, expires: '123' },
      status: 'authenticated'
    })

    render(<SignInButton />)
    expect(screen.getByText('Jonh Doe')).toBeInTheDocument()
  })
})
