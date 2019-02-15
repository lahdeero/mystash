import React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Chip } from 'react-materialize'
// import useFilter from '../../hooks/useFilter'

const ListNote = (props) => {

  const handleClick = (tagi) => {
    props.filter.setFilter(tagi.tag)
  }

  const note = props.note
  if (note === undefined || note.id === undefined) return (<div />)
  let tags = note.tags
  if (tags === undefined) tags = ['EI TAGIA', 'HUOM']
  const text = note.content.length <= 150 ? note.content : note.content.substring(0, 150) + '...'
  let css = 'card-panel deep-purple lighten-4'
  return (
    <div className={css}>
      <Row>
        <Col>
          <Link to={`/notes/${note.id}`}> <span s={12} className='blue-text text-darken-2'>{note.title} </span> </Link>
        </Col>
        <Col>
          {tags.join(',').split(',').map(tag =>
            <Chip key={tag} onClick={() => { handleClick({ tag }) }}> {tag} </Chip>)}
        </Col>
      </Row>
      <div>
        {text.split('\n').map(function (row, key) {
          return (
          <span key={key}> {row} <br /> </span>
          )
        })}
      </div>
    </div>
  )
}

export default ListNote
