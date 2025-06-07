import styled from 'styled-components'
import Input from './common/Input'

const FilterContainer = styled.div`
  position: relative;
  margin: .2rem .2rem;

  > div {
    align-items: center;
  }
`

// Handlechange in App
const Filter = ( { filter }: any ) => {
  if (window.location.pathname !== '/') {
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
