import { useCallback, useState } from 'react'

const useFilter = () => {
  const [value, setValue] = useState('')

  const onChange = (event: any) => {
    setValue(event.target.value)
  }

  const setFilter = useCallback((value: any) => {
    setValue(value)
  }, [])

  return {
    value,
    onChange,
    setFilter
  }
}

export default useFilter
