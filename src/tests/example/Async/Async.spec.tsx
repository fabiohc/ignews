import {
  render,
  screen
  // waitFor,
  // waitForElementToBeRemoved
} from '@testing-library/react'

import { Async } from '.'

describe('ASYNC EXAMPLE', () => {
  it('async example renders correctly', async () => {
    render(<Async />)

    expect(screen.getByText('Hello')).toBeInTheDocument()

    expect(await screen.findByText('button is visible')).toBeInTheDocument()

    // await waitFor(() =>
    //   expect(screen.getByText('button is visible')).toBeInTheDocument()
    // )

    // when u wanna check if element was removed
    // await waitForElementToBeRemoved(screen.queryByText('button is visible'))
  })
})
