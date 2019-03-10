import React from 'react'

/* Handlechange in App */
const Filter = (props) => {
  const style = {
    marginBottom: 10
  }

  return (
    <div style={style}>
      <input onChange={props.filter.onChange} value={props.filter.value} />
    </div>
  )
}

export default Filter
