import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { mocked } from 'jest-mock'

import Home, { getStaticProps } from '../../pages'
import { stripe } from '../../services/stripe'

jest.mock('next-auth/react')
jest.mock('../../services/stripe')

describe('HOME PAGE', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated'
    })

    render(
      <Home product={{ priceId: 'fake-price-id', amount: 'fake-amount' }} />
    )

    expect(screen.getByText('for fake-amount month')).toBeInTheDocument()
  })

  it('loads initial data correctly by get static props', async () => {
    const retrieveMocked = mocked(stripe.prices.retrieve)

    retrieveMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 1000
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-price-id',
            amount: '$10.00'
          }
        },
        revalidate: 86400
      })
    )
  })
})
