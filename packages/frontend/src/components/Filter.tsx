import styled from 'styled-components'
import Input from './common/Input'
import { useLocation } from 'react-router-dom'

const FilterContainer = styled.div`
  position: relative;
  margin: .2rem .2rem;

  > div {
    align-items: center;
  }
`

const Filter = ( { filter }: any ) => {
  const { pathname } = useLocation()
  if (pathname !== '/') {
    return (
      <div />
    )
  }

  return (
    <FilterContainer>
      <Input
        name="filter"
        type="text"
        onChange={filter.onChange}
        value={filter.value}
        clear={ filter.value.length > 1 }
        clearCallback={() => filter.setFilter('')}
      >
      </Input>
    </FilterContainer>
  )
}

export default Filter
