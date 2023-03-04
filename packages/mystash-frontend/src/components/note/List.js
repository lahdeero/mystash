import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { ClipLoader } from 'react-spinners'
import ListNote from './ListNote'
import SortDropdown from './SortDropdown'
import Container from '../common/Container'
import styled from 'styled-components'
import Pagination from '../paging/Pagination'
import Info from '../common/Info'

const SortAndPagingWrapper = styled.div`
  display: flex;
  justify-content: center;

  ul {
    margin: auto;
  }

  div {
    align-self: flex-end;
  }

  @media only screen and (max-width: 600px) {
    flex-direction: column-reverse;

    div {
      align-self: flex-start;
      margin-bottom: 2rem;
    }

    ul {
      margin: 0;
      align-self: flex-start;
    }
  }
`

const UnstyledUl = styled.ul`
  padding: 0;
`

const List = ( { notes, sortNotes, filter, loading } ) => {
  const [page, setPage] = useState(1)
  const [notesPerPage] = useState(10)

  if (!notes) {
    return (
      <Info>Could not find notes!</Info>
    )
  }

  const handleSelect = async (selectedKey) => {
    if (selectedKey !== undefined || selectedKey !== null) {
      return setPage(selectedKey)
    }
  }

  const filterNotes = (allNotes, filter) => {
    if (filter && (filter !== undefined || null || '')) {
      try {
        const filterByTitle = allNotes.filter(note => note.title.toLowerCase().includes(filter.toLowerCase()))
        const filterByTag = allNotes.filter(note => note.tags.join(' ').toLowerCase().includes(filter.toLowerCase()))
        return Array.from(new Set(filterByTitle.concat(filterByTag)))
      } catch (e) {
        console.error(e)
      }
    }
    return allNotes
  }

  const compareStrings = (c, d, ascending) => {
    if (c < d) { return ascending ? -1 : 1 }
    if (c > d) { return ascending ? 1 : -1 }
    return 0
  }

  const compareDates = (date1, date2) => {
    if (!date1 && !date2) {
      return 0
    } else if (!date2 || date1 > date2) {
      return -1
    } else if (!date1 || date1 < date2) { return 1 }
    return 0
  }

  const sortFunction = (a, b) => {
    switch (sortNotes) {
    case 'ALPHABETIC':
      return compareStrings(a.title.toLowerCase().trim(), b.title.toLowerCase().trim(), true)
    case '!ALPHABETIC':
      return compareStrings(a.title.toLowerCase().trim(), b.title.toLowerCase().trim(), false)
    case 'MODIFIED':
      return compareDates(a.modified_date, b.modified_date)
    case '!MODIFIED':
      return compareDates(b.modified_date, a.modified_date)
    case '!CREATED':
      return a.id - b.id
    default:
      return b.id - a.id
    }
  }

  const filteredNotes = filterNotes([...notes].sort(sortFunction), filter.value)
  const notesToShow = filteredNotes.slice((page - 1) * notesPerPage, (page - 1) * notesPerPage + notesPerPage)
  const showBottomPagination = notes.length > 7 ? true : false

  const SortAndPaging = ({ itemsLenght: itemsLength, notesPerPage, page, handleSelect, hideSort }) => {
    return (
      <SortAndPagingWrapper>
        <Pagination
          itemCount={itemsLength}
          itemsPerPage={notesPerPage}
          activePage={page}
          maxButtons={10}
          onSelect={handleSelect}
        />
        { hideSort ? <div></div> : <SortDropdown/> }
      </SortAndPagingWrapper>
    )
  }

  return (
    <Container>
      <div>
        <ClipLoader loading={loading} color='blue' />
        <SortAndPaging
          itemsLenght={filteredNotes.length}
          notesPerPage={notesPerPage}
          page={page}
          handleSelect={handleSelect}
        />
      </div>
      <UnstyledUl>
        {notesToShow.map(note => <li key={note.id}>
          <div>
            <ListNote note={note} Key={note.id} filter={filter} />
          </div>
        </li>
        )}
      </UnstyledUl>
      <div>
        {
          showBottomPagination &&
          <SortAndPaging
            itemsLenght={filteredNotes.length}
            notesPerPage={notesPerPage}
            page={page}
            handleSelect={handleSelect}
            hideSort={true}
          />
        }
      </div>
    </Container>
  )
}

const mapStateToProps = (store) => {
  return {
    notes: store.notes,
    sortNotes: store.sortNotes,
  }
}

export default withRouter(connect(
  mapStateToProps
)(List))
