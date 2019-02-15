import React from 'react';
import Textarea from 'react-textarea-autosize'
import { connect } from 'react-redux'
import { Button } from 'react-materialize'
import { Redirect } from 'react-router-dom'

import { createNote } from '../../reducers/noteReducer'
import { notify, errormessage } from '../../reducers/notificationReducer'

class Form extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isMounted: false,
			redirect: false,
			redirect_url: '',
			tagText: '',
			title: '',
			content: '',
			tags: []
		}
	}
	componentDidMount() {
		this.setState( { isMounted: true } )
	}
	componentWillUnmount() {
	    this.setState( { isMounted: false } )
	}

	handleChange = (event) => {
		if(!this.state.isMounted) return
  	// console.log(event.target.name, event.target.value)
  	this.setState({ [event.target.name]: event.target.value })
  }
	handleContent = (event) => {
		this.setState({ content: event.target.value })
	}

	addTag = async (event) => {
		event.preventDefault()
		const maxTags = 10
		if (this.state.tags.length >= maxTags) {
			this.props.notify(`Maxium number of tags is '${maxTags}'`, 10)
			return
		}
		if (this.state.tagText.length === 0 || this.state.tags.includes(this.state.tagText)) return
		let newTags = this.state.tags
		newTags.push(this.state.tagText)
		try {
			await this.setState({
				tags: newTags,
				tagText: ''
			})
		} catch(exception) {
			this.props.errormessage('ERROR WHILE ADDING TAG', 10)
		}
	}

	removeTag (name) {
		this.setState({
			tags: this.state.tags.filter(tag => tag !== name)
		})
	}

	handleSubmit = async (event) => {
		event.preventDefault()
		console.log('click')
		// If user didnt hit "Add tag" but there's text in "add tag field" 
		if ((this.state.tags === undefined || this.state.tags.length === 0) && this.state.tagText.length > 0) {
			const newTags = this.state.tagText.split(';')
			await this.setState({
				tags: newTags
			})
		}
		try {
			const noteObject = await {
				title: this.state.title,
				content: this.state.content,
				tags: this.state.tags
			}
			const id = await this.props.createNote(noteObject)
			await this.props.notify(`you created '${noteObject.title}'`, 10)
			this.setState({
				title: '',
				content: '',
				tag_id: ''
			})
			await this.setState({ redirect_url: '/notes/' + id })
			await this.setState({ redirect: true })
		} catch(exception) {
			this.props.errormessage('ERROR WHILE ADDING NOTE', 10)
		}
	}

	render() {
		if (this.state.redirect) {
			return <div><Redirect to={this.state.redirect_url} /></div>
			// return <div><Redirect to='/' /></div>
		}

		return(
    <div className="container">
      	<h2>Create new note</h2>

			<form id="noteform" onSubmit={this.handleSubmit}>
        	<div>
          	Title<br />
          	<input name='title' value={this.state.title} onChange={this.handleChange} />
         	</div>
         	<div>
          	<label>
	 				 	Content<br />
              <Textarea className="note-edit" value={this.state.content} onChange={this.handleContent} minRows={10} />
       			</label>
         	</div>
	 				<br/>
			</form>

			<div>
				{this.state.tags.map(tag =>
				<Button key={tag} onClick={() => { this.removeTag(tag) }}> {tag} </Button>
				)}
			</div>
		 	 
			<form id="tagform" onSubmit={this.addTag}>
				<Button className="deep orange" type="submit" form="tagform">Add tag</Button> 
				<div>
						<br />
						<input name='tagText' value={this.state.tagText} onChange={this.handleChange}/>
				</div>
			</form>
		 
		 	<div>
				<br />
       	<Button form="noteform" className="red accent-2" type="submit">Create</Button>
			</div>
		</div>  
	)
 }
}

const mapDispatchToProps = {
	createNote,
	notify,
	errormessage
}

const ConnectedNoteForm = connect(
	null,
	mapDispatchToProps
)(Form)

export default ConnectedNoteForm

