import { render, screen } from '@testing-library/react'

import { ActiveLink } from './index'

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})

describe('ACTIVE LINK COMPONENT', () => {
  it('Renders active link.', () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>home</a>
      </ActiveLink>
    )

    expect(screen.getByText('home')).toBeInTheDocument()
  })

  it('Set class "active" to active link.', () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>home</a>
      </ActiveLink>
    )

    expect(screen.getByText('home')).toHaveClass('active')
  })
})
