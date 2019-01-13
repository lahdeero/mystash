import React, { Component } from 'react';
import { Navbar,Row,Input,Icon,Button } from 'react-materialize'
import { actionForRegister, setLogin } from '../reducers/userReducer'
import { connect } from 'react-redux'
import { noteInitialization, createButDontSave } from '../reducers/noteReducer';

class Register extends Component {
  constructor() {
	super()
	this.state = {
      firstname: '',
      lastname: '',
	  username: '',
      password: '',
      email: '',
	  error: null,
	  redirect: false
	}
  }

  handleRegister = async (event) => {
    event.preventDefault()
	try {
	  const tokenAndMessage = await this.props.actionForRegister({
        realname: this.state.firstname + ' ' + this.state.lastname,
		username: this.state.username,
        password: this.state.password,
        email: this.state.email
	  })
	  const user = await tokenAndMessage[0]
	  await createButDontSave(tokenAndMessage[1])
	  await window.localStorage.setItem('loggedMystashappUser', JSON.stringify(user))
	  await setLogin(user)
	  await window.location.reload();
	} catch(exception) {
	  this.setState({
		error: 'Username already in use or contains illegal characters'
	  })
	  setTimeout(() => {
		this.setState({ error: null })
      }, 5000)
	}
  }

  handleRegisterFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  } 

  render() {
    return (
      <div>
	   <Navbar className="indigo" brand='my-stash' right>
		</Navbar>
        <div className="container">
          <div>{this.state.error}</div>
          <form onSubmit={this.handleRegister}>
            <Row>
              <Input onChange={this.handleRegisterFieldChange} name="firstname" label="First Name" ><Icon>accessibility</Icon></Input>
              <Input onChange={this.handleRegisterFieldChange} name="lastname" s={6} label="Last Name" ><Icon>accessibility_new</Icon></Input>
              <Input onChange={this.handleRegisterFieldChange} name="username" s={12} label="Username" ><Icon>account_circle</Icon></Input>
              <Input onChange={this.handleRegisterFieldChange} name="password" type="password" label="password" s={12} ><Icon>https</Icon></Input>
              <Input onChange={this.handleRegisterFieldChange} name="email" type="email" label="Email" s={12} ><Icon>email</Icon></Input>
            </Row>
 			<Button type="submit">Register</Button>
          </form>
        </div>
      </div>
    )
  }
}
const mapDispatchToProps = {
  actionForRegister,
  setLogin,
  createButDontSave,
  noteInitialization
}

const ConnectedRegister = connect(
  null,
  mapDispatchToProps
)(Register)

export default ConnectedRegister