import { useState } from 'react'

const useFilter = () => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const setFilter = (value) => {
    setValue(value)
  }

  return {
    value,
    onChange,
    setFilter
  }
}

export default useFilter
