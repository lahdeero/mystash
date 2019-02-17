import React, { useState } from 'react'
import { Pagination } from 'react-materialize'

import ListNote from './ListNote'

const List = (props) => {
  const [page, setPage] = useState(1)
  const [notesPerPage] = useState(10)

  const handleSelect = async (selectedKey) => {
    if (selectedKey !== undefined || selectedKey !== null) {
      return setPage(selectedKey)
    }
  }

  const removeDuplicatesUsingSet = (array) => {
    let UniqueArray = Array.from(new Set(array))
    return UniqueArray
  }

  let key = 1
  const filter = props.filter.value
  const allNotes = props.notes
  let notesToShow = allNotes
  if (filter && (filter !== undefined || null || '')) {
    try {
      const filterByTitle = allNotes.filter(note => note.title.toLowerCase().includes(filter.toLowerCase()))
      const filterByTag = allNotes.filter(note => note.tags.join(' ').toLowerCase().includes(filter.toLowerCase()))
      notesToShow = removeDuplicatesUsingSet(filterByTitle.concat(filterByTag))
    } catch (e) {
      // NOT SURE IF THIS IS EVEN NEEDED ANYMORE; BUG FIXED
      console.log(e)
    }
  }
  const start = (page - 1) * notesPerPage
  const end = start + notesPerPage
  notesToShow = notesToShow.slice(start, end)

  return (
    <div className="container">
      <div className="center">
        <Pagination items={Math.ceil(props.notes.length / notesPerPage)} activePage={page} maxButtons={10} onSelect={handleSelect} />
      </div>
      <ul>
        {notesToShow.map(note => <li key={key++}>
          <div>
            <ListNote note={note} Key={key} filter={props.filter} />
          </div>
        </li>
        )}
      </ul>
      <div className="center">
        <Pagination items={Math.ceil(props.notes.length / notesPerPage)} activePage={page} maxButtons={10} onSelect={handleSelect} />
      </div>
    </div>
  )
}

export default List
