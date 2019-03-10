import React from 'react'
import { Pagination } from 'react-bootstrap'

import '../App.css'

const Paging = ({ currentPage, lastPage, handleSelect }) => {
  // console.log(currentPage)
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td align='left'>
              <code>Page {currentPage} / {lastPage}</code>
            </td>
            <td colSpan='5'>
              <Pagination>
                <Pagination.First onClick={() => handleSelect(1)}>First</Pagination.First>
                <Pagination.Prev onClick={() => handleSelect(2)}>Prev</Pagination.Prev>
                <Pagination.Item active>{currentPage}</Pagination.Item>
                <Pagination.Next onClick={() => handleSelect(3)}>Next</Pagination.Next>
                <Pagination.Last onClick={() => handleSelect(4)}>Last</Pagination.Last>
              </Pagination>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Paging
