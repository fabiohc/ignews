import { render, screen } from '@testing-library/react'

import { Header } from './index'

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})

jest.mock('next-auth/react', () => {
  return {
    useSession() {
      return [null, false]
    }
  }
})

describe('HEADER COMPONENT', () => {
  it('renders header correctly', () => {
    render(<Header />)

    // Suggest methods to select elements (findBy, getBy, queryBy)
    screen.logTestingPlaygroundURL()

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
  })
})
