import { Box, render, Static, Text, useApp } from 'ink'
import { useEffect, useState } from 'react'

function Counter() {
  const [counter, setCounter] = useState(0)
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'icebreaker',
    },
    {
      id: 2,
      name: 'iceb reaker',
    },
    {
      id: 3,
      name: 'ice breaker',
    },
  ])
  const { exit } = useApp()

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(previousCounter => previousCounter + 1)
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (counter >= 20) {
      setItems(items => [...items, { id: 4, name: 'sonofmagic' }])
    }
    if (counter >= 50) {
      exit()
    }
  }, [counter])

  // useInput((input) => {
  //   console.log(input)
  // })

  return (
    <>
      <Text color="green">
        {counter}
        {' '}
        tests passed
      </Text>
      <Box borderStyle="round" padding={4}>
        <Text color="blue">
          Press Ctrl+C to exit
        </Text>
      </Box>
      <Static items={items}>
        {
          (item) => {
            return <Text>{item.name}</Text>
          }
        }

      </Static>
    </>

  )
}

render(<Counter />)
