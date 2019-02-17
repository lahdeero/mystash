import { useState } from 'react'
import { connect } from 'react-redux'
import { Row, Navbar, Input, Icon, Button } from 'react-materialize'
import { actionForRegister, setLogin } from '../reducers/userReducer'

const Register = (props) => {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [redirect, setRedirect] = useState(false)

  const validateInput = () => {
    if (username.length < 3) {
      setError('usename must be atleast 3 characters')
      setTimeout(() => { setError('') }, 5000)
      return false
    } else if (password.length < 6) {
      setError('password must be atleast 6 characters')
      setTimeout(() => { setError('') }, 5000)
      return false
    }
    return true
  }
  const handleRegister = async (event) => {
    event.preventDefault()
    if (validateInput()) {
      try {
        const tokenAndMessage = await props.actionForRegister({
          realname: firstname + ' ' + lastname,
          username: username,
          password: password,
          email: email
        })
        const user = tokenAndMessage[0]
        await window.localStorage.setItem('loggedMystashappUser', JSON.stringify(user))
        await setRedirect(true)
        await props.setLogin(user) // must be last line, activates App.js to "reload"
      } catch (exception) {
        setError('Username not available')
        setTimeout(() => {
          setError('')
        }, 5000)
      }
    }
  }

  return (
    <div>
      <Navbar className="indigo" brand='my-stash' right>
      </Navbar>
      <div className="container">
        <div>
          {!redirect && error ? <div className="error">{error}</div> : <div className="notification">Fields with (*) are required</div>}
          <form onSubmit={handleRegister}>
            <Row>
              <Input onChange={(event) => setFirstname(event.target.value)} name="firstname" label="First Name" ><Icon>accessibility</Icon></Input>
              <Input onChange={(event) => setLastname(event.target.value)} name="lastname" s={6} label="Last name" ><Icon>accessibility_new</Icon></Input>
              <Input onChange={(event) => setUsername(event.target.value)} name="username" s={12} label="Username(*)" ><Icon>account_circle</Icon></Input>
              <Input onChange={(event) => setPassword(event.target.value)} name="password" type="password" label="Password(*)" s={12} ><Icon>https</Icon></Input>
              <Input onChange={(event) => setEmail(event.target.value)} name="email" type="email" label="Email" s={12} ><Icon>email</Icon></Input>
            </Row>
            <Button type="submit">Register</Button>
          </form>
        </div>
        <br />
        <br />
        Back to <a onClick={props.handleRegisterRedirect} href="/register">login</a>
      </div>
    </div>
  )
}

const mapStateToProps = (store) => {
  return {
    notes: store.notes,
    user: store.user
  }
}
const mapDispatchToProps = {
  actionForRegister,
  setLogin
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register)
