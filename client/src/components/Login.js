import React, { Component } from 'react';
import { Navbar,Input,Icon,Button } from 'react-materialize'
import { connect } from 'react-redux'
import { actionForLogin } from '../reducers/userReducer'
import {noteInitialization} from '../reducers/noteReducer'
import Register from './Register'
import '../App.css'

class Login extends Component {
	constructor() {
		super()
		this.state = {
			username: '',
			password: '',
			user: null,
			error: null,
			register: false
		}
	}
	handleLogin = async (event) => {
		event.preventDefault()
		try {
			const user = await this.props.actionForLogin({
				username: this.state.username,
				password: this.state.password
			})
			await this.props.noteInitialization(user)
		} catch(exception) {
			this.setState({
				error: 'Bad credentials'
			})
			setTimeout(() => {
				this.setState({ error: null })
			}, 5000)
		}
	}
	handleLoginFieldChange = (event) => {
		this.setState({ [event.target.name]: event.target.value })
	} 
	handleRegisterRedirect = async (event) => {
		event.preventDefault()
		this.setState({ register: true })
	}

	render() {
		if (this.state.register) {
			return (
				<div>
				<Register />
				</div>
			)
		}
		return (
			<div>
				<Navbar className="indigo" brand='my-stash' right>
				</Navbar>
				<div className="container centered">
					<div>
						{this.state.error}
					</div>
					<form onSubmit={this.handleLogin}>
  					<div>
  					  username: 
  					  <Input
  					    type="text"
  					    name="username"
  					    value={this.state.username}
  					    onChange={this.handleLoginFieldChange}
  					  ><Icon>account_circle</Icon></Input>
  					</div>
  					<div>
  					  password: 
  					  <Input
  					    type="password"
  					    name="password"
  					    value={this.state.password}
  					    onChange={this.handleLoginFieldChange}
  					  ><Icon>https</Icon></Input>
  					</div>
  					<Button type="submit">Login</Button>
					</form>
					<div>
						<br />
						Dont have account? <a onClick={this.handleRegisterRedirect} href="/register">Register here</a>
					</div>
				</div>
			</div>
		)
	}
}

const mapDispatchToProps = {
	actionForLogin,
	noteInitialization
}

const ConnectedLogin = connect(
	null,
	mapDispatchToProps
)(Login)

export default ConnectedLogin