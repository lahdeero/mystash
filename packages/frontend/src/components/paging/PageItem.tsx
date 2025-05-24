import React from 'react'

const PageItem = ( { title, active, onClick, disabled }: any ) => {
  const className = active ? 'active' : disabled ? 'disabled' : undefined

  return (
    <li tabIndex={0} className={className} onClick={onClick}>{title}</li>
  )
}

export default PageItem
