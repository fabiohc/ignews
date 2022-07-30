import { useEffect, useState } from 'react'

export function Async() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div>
      <div>Hello</div>

      {visible && <button>button is visible</button>}
    </div>
  )
}
