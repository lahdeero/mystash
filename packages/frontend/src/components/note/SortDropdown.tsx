import { connect } from 'react-redux'
import styled from 'styled-components'
import { sortOptions, sortAlphabetic, sortCreated, sortModified } from '../../reducers/sortReducer'
import Colors from '../../layout/colors'

const DropdownWrapper = styled.div`
  display: flex;
  height: 1.5rem;

  label {
    align-self: flex-end;
    padding-right: .5rem;
  }

  select {
    background-color: ${Colors.White}
  }
`

const SortDropdown = ({ sortNotes, sortAlphabetic, sortCreated, sortModified }: any) => {
  const handleChange = (event: any) => {
    switch (event.target.value) {
    case 'ALPHABETIC':
      sortAlphabetic()
      break
    case 'CREATED':
      sortCreated()
      break
    case 'MODIFIED':
      sortModified()
      break
    default:
    }
  }

  return (
    <DropdownWrapper>
      <label htmlFor="sort-select">Sort:</label>
      <select id="sort-select" onChange={handleChange} value={sortNotes}>
        { sortOptions.map(o => <option key={o} value={o}>{o}</option>) }
      </select>
    </DropdownWrapper>
  )
}

const mapStateToProps = (store: any) => {
  return {
    sortNotes: store.sortNotes,
  }
}
const mapDispatchToProps = {
  sortAlphabetic,
  sortCreated,
  sortModified
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SortDropdown)
