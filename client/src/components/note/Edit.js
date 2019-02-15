import React from 'react'
import Textarea from 'react-textarea-autosize'
import { connect } from 'react-redux'
import { Button, Chip, Row, Col } from 'react-materialize'
import { Redirect } from 'react-router-dom'

import { modifyNote } from '../../reducers/noteReducer'
import noteService from '../../services/NoteService.js'
import { notify, errormessage } from '../../reducers/notificationReducer'

class Edit extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isMounted: false,
      redirect: false,
      tagText: '',
      id: '',
      title: '',
      content: '',
      tags: []
    }
  }

  async componentWillMount () {
    const oneNoteArr = await noteService.getOne(this.props.match.params.id)
    try {
      await this.setState({
        id: oneNoteArr[0].id,
        title: oneNoteArr[0].title,
        content: oneNoteArr[0].content,
        tags: oneNoteArr[0].tags.filter(tag => tag !== null)
      })
    } catch (eception) {
      this.props.errormessage(`Couldn't find note '${this.props.match.params.id}'`, 5)
      this.setState({
        redirect: true
      })
    }
  }
  async componentDidMount () {
    this.setState({ isMounted: true })
  }
  async componentWillUnmount () {
    this.setState({ isMounted: false })
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const noteObject = await {
        id: this.state.id,
        title: this.state.title,
        content: this.state.content,
        tags: this.state.tags
      }
      await this.props.modifyNote(noteObject)
      await this.props.notify(`you modified '${noteObject.title}'`, 10)
      // Cant set id to empty 'cos of redirect
      this.setState({
        title: '',
        content: '',
        tags: []
      })
      await this.setState({ redirect: true })
    } catch (exception) {
      console.log(exception)
      this.props.errormessage('ERROR WHILE EDITING NOTE', 10)
    }
  }
  handleChange = (event) => {
    if (!this.state.isMounted) return
    // console.log(event.target.name, event.target.value)
    this.setState({ [event.target.name]: event.target.value })
  }
  handleContent = (event) => {
    this.setState({ content: event.target.value })
  }

  addTag = async (event) => {
    event.preventDefault()
    const maxTags = await 4
    if (this.state.tagText.length === 0 || this.state.tags.includes(this.state.tagText)) return
    let newTags = await this.state.tags
    await newTags.push(this.state.tagText)
    if (newTags.length > maxTags) {
      this.props.notify(`Maxium number of tags is '${maxTags}'`, 10)
    } else {
      try {
        await this.setState({
          tags: newTags,
          tagText: ''
        })
      } catch (exception) {
        this.props.errormessage('ERROR WHILE ADDING TAG', 10)
      }
    }
  }

  removeTag (name) {
    this.setState({
      tags: this.state.tags.filter(tag => tag !== name)
    })
  }

  render () {
    if (this.state.redirect) {
      const redirecturl = '/' // 'notes/' + this.state.id
      return <div><Redirect to={redirecturl} /></div>
    }

    return (
      <div className="container">
        <div>
          <h3>Note tags&nbsp;</h3>
          <Button className="indigo" position="right" delay="50" tooltip="Click tag name to remove">[?]</Button>
        </div>
        <div>
          <Row>
            <Col s={12}>
              {this.state.tags.map(tag =>
                <Chip key={tag} onClick={() => { this.removeTag(tag) }}> {tag} </Chip>
              )}
            </Col>
          </Row>
        </div>
        <div>
          <form id="tagform" onSubmit={this.addTag}>
            <div>
              <br />
              <input name="tagText" value={this.state.tagText} onChange={this.handleChange} />
            </div>
            <br />
            <Button className="deep orange" type="submit" form="tagform">Add tag</Button>
          </form>
        </div>
        <h2>Edit note</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            Title<br />
            <input name="title" value={this.state.title} onChange={this.handleChange} />
          </div>
          <div>
            <label>
              Content<br />
              <Textarea className="note-edit" value={this.state.content} onChange={this.handleContent} minRows={10} />
            </label>
          </div>
          <br />
          <Button waves="light" className="red accent-2" type="submit">Save</Button>
        </form>
      </div>
    )
  }
}

const mapDispatchToProps = {
  modifyNote,
  notify,
  errormessage
}

const ConnectedEditNote = connect(
  null,
  mapDispatchToProps
)(Edit)

export default ConnectedEditNote
