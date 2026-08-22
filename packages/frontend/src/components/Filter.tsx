import styled from 'styled-components'
import Input from './common/Input'
import MagnifyingGlassIcon from '../assets/magnifying_glass.svg'
import ClearIcon from '../assets/clear.svg'
import { useLocation } from 'react-router-dom'

const FilterContainer = styled.div`
  position: relative;
  padding: 0rem 2rem 0 2rem;

  .filter-icon {
    position: absolute;
    right: 3rem;
    top: 1rem;
    transform: translateY(-50%);
    width: 25px;
    height: 25px;
  }

  .filter-icon > img,
  .filter-icon > button {
    position: absolute;
    inset: 0;
    width: 25px;
    height: 25px;
  }

  .filter-icon button {
    padding: 0;
    margin: 0;
    border: 0;
    background: none;
  }

  .filter-icon button img {
    display: block;
    width: 25px;
    height: 25px;
  }
`

const Filter = ({ filter }: any) => {
  const { pathname } = useLocation()
  const showClear = filter.value.length > 0
  if (pathname !== '/') {
    return (
      <div />
    )
  }

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault()
    filter.setFilter('')
  }

  return (
    <FilterContainer className="filter-container">
      <Input
        name="filter"
        label=""
        placeholder="Filter notes..."
        type="text"
        onChange={filter.onChange}
        value={filter.value}
      >
        <div className="filter-icon">
          {!showClear ? (
            <img src={MagnifyingGlassIcon} alt="" />
          ) : (
            <button onClick={handleClear}>
              <img src={ClearIcon} alt="Clear" />
            </button>
          )}
        </div>
      </Input>
    </FilterContainer>
  )
}

export default Filter
