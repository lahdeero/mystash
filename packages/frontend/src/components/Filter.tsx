import React from 'react'
import styled from 'styled-components'
import Input from './common/Input'
import SearchIcon from '../assets/magnifying_glass.svg'

const FilterContainer = styled.div`
  position: relative;
  margin: .2rem .2rem;

  > div {
    align-items: center;
  }
`

// Handlechange in App
const Filter = ( { filter } ) => {
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
        image={filter.value.length > 0 ? null : (<img className="explainer active" src={ SearchIcon }
          alt="Magnifying glass" />) }
        imageLeft={'25px'}
        clear={ filter.value.length > 1 }
        clearCallback={() => filter.setFilter('')}
      >
      </Input>
    </FilterContainer>
  )
}

export default Filter
