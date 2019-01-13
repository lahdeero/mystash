import React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Chip } from 'react-materialize'

class ListNote extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  handleClick (tagi) {
    this.props.handleChange(tagi.tag)
  }

  render () {
    const note = this.props.note
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
              <Chip key={tag} onClick={() => { this.handleClick({ tag }) }}> {tag} </Chip>)}
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
}
export default ListNote
