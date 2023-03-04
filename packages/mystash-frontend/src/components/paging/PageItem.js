import React from 'react'

const PageItem = ( { title, active, onClick, disabled } ) => {
  const className = active ? 'active' : disabled ? 'disabled' : null

  return (
    <li tabIndex="0" className={className} onClick={onClick}>{title}</li>
  )
}

export default PageItem
