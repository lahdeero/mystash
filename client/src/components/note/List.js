import React from 'react'
import { connect } from 'react-redux'
import { Pagination } from 'react-materialize'
import { actionForFilter } from '../../reducers/filterReducer'
import { noteInitialization } from '../../reducers/noteReducer'

import ListNote from './ListNote'

class List extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			page: 1,
			notesPerPage: 10,
			notes: []
		}
	}

	componentWillMount() {
		if (this.props.notes.length === 0) {
			this.props.noteInitialization(this.props.user)
		}
	}

	handleSelect = async (selectedKey) => {
		if (selectedKey !== undefined || selectedKey !== null) {
			return this.setState({ page: selectedKey })
		}
		return this.setState({  })
	}

	removeDuplicatesUsingSet = (array) => {
		let unique_array = Array.from(new Set(array))
		return unique_array
	}


	render() {
		let key = 1
		const filter = this.props.filter
		const allNotes = this.props.notes
		let notesToShow = allNotes
		if (filter && (filter !== undefined || null || '')) {
			try {
				const filterByTitle = allNotes.filter(note => note.title.toLowerCase().includes(filter.toLowerCase()))
				const filterByTag = allNotes.filter(note => note.tags.join(' ').toLowerCase().includes(filter.toLowerCase()))
				notesToShow = this.removeDuplicatesUsingSet(filterByTitle.concat(filterByTag))
			} catch (e) {
				//NOT SURE IF THIS IS EVEN NEEDED ANYMORE; BUG FIXED
				console.log(e)
			}
		} 
		const start = (this.state.page-1)*this.state.notesPerPage
		const end = start+this.state.notesPerPage
		notesToShow = notesToShow.slice(start, end)
		

		return (
			<div className="container">
					<div className="center">
						<Pagination items={Math.ceil(this.props.notes.length/this.state.notesPerPage)} activePage={this.state.page} maxButtons={10} onSelect={this.handleSelect} />
					</div>
					<ul>
						{notesToShow.map(note => <li key={key++}>
							<div>
								<ListNote note={note} Link={this.props.Link} Key={key} handleChange={this.props.actionForFilter} />
							</div>
						</li>
						)}
					</ul>
					<div className="center">
						<Pagination items={Math.ceil(this.props.notes.length/this.state.notesPerPage)} activePage={this.state.page} maxButtons={10} onSelect={this.handleSelect} />
					</div>
			</div>
		)
	}
}

const mapStateToProps = (store) => {
	return {
		user: store.user,
		notes: store.notes,
		filter: store.filter
	}
}
const mapDispatchToProps = {
	noteInitialization,
	actionForFilter
}
const ConnectedList = connect(
	mapStateToProps,
	mapDispatchToProps
)(List)

export default ConnectedList