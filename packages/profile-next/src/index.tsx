import { Text } from 'ink'
import React, { useEffect, useState } from 'react'

export function Counter() {
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(previousCounter => previousCounter + 1)
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <Text color="green">
      {counter}
      {' '}
      tests passed
    </Text>
  )
}
