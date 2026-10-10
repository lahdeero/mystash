import styled from 'styled-components'
import {
  sortOptions,
  sortAlphabetic,
  sortCreated,
  sortModified,
} from '../../reducers/sortReducer'
import { useAppDispatch, useAppSelector } from '../../store'

const DropdownWrapper = styled.div`
  display: flex;
  height: 1.5rem;

  label {
    align-self: flex-end;
    padding-right: 0.5rem;
  }

  select {
    color: ${({ theme }) => theme.Text};
    background-color: ${({ theme }) => theme.Background};
  }
`

const SortDropdown = () => {
  const dispatch = useAppDispatch()
  const sortNotes = useAppSelector((state) => state.sortNotes)
  const handleChange = (event: any) => {
    switch (event.target.value) {
      case 'ALPHABETIC':
        dispatch(sortAlphabetic())
        break
      case '!ALPHABETIC':
        dispatch({ type: '!ALPHABETIC' })
        break
      case 'CREATED':
        dispatch(sortCreated())
        break
      case '!CREATED':
        dispatch({ type: '!CREATED' })
        break
      case 'MODIFIED':
        dispatch(sortModified())
        break
      case '!MODIFIED':
        dispatch({ type: '!MODIFIED' })
        break
      default:
    }
  }

  return (
    <DropdownWrapper>
      <label htmlFor="sort-select">Sort:</label>
      <select id="sort-select" onChange={handleChange} value={sortNotes}>
        {sortOptions.map((o) => (
          <option key={o} value={o}>
            {o === '!ALPHABETIC'
              ? 'alphabetic reverse'
              : o === '!MODIFIED'
                ? 'modified reverse'
                : o === '!CREATED'
                  ? 'created reverse'
                  : o.toLowerCase()}
          </option>
        ))}
      </select>
    </DropdownWrapper>
  )
}

export default SortDropdown
