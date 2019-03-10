import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import './App.css'
import Menu from './components/Menu'
import Login from './components/Login'
import List from './components/note/List'
import Show from './components/note/Show'
import Edit from './components/note/Edit'
import Form from './components/note/Form'
import Settings from './components/Settings'
import Notification from './components/Notification'
import { noteInitialization, clearNotes } from './reducers/noteReducer'
import { actionForLogin, setLogin, actionForLogout } from './reducers/userReducer'
import useFilter from './hooks/useFilter'

const App = (props) => {
  const filter = useFilter()
  const [state, setState] = useState({ user: null, notes: [], navigation: 0, logged: 0 })

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedMystashappUser')
    if (state.logged === 0 && loggedUserJSON) {
      init(loggedUserJSON)
    }
  })

  const init = async (loggedUserJSON) => {
    console.log('meneee2')
    const user = JSON.parse(loggedUserJSON)
    await setState({
      user: user,
      notes: [],
      navigation: 1,
      logged: 1
    })
    await props.setLogin(user)
    await props.noteInitialization(user)
  }

  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedMystashappUser')
    filter.setFilter('')
    props.clearNotes()
    props.actionForLogout()
    setState({ user: null, navigation: 0, logged: 0 })
  }

  if (state.logged === 1) {
    return (
      <div>
        <Notification />
        <Router>
          <div>
            <Menu currentPage={state.navigation} filter={filter} handleLogout={handleLogout} />
            <Route exact path="/" render={() => <List notes={props.notes} filter={filter} />} />
            <Route path="/login" render={() => <Login />} />
            <Route path="/create" render={() => <Form />} />
            <Route path="/settings" render={() => <Settings />} />
            <Route exact path="/notes/:id" component={Show} />
            <Route exact path="/notes/edit/:id" component={Edit} />
          </div>
        </Router>
      </div>
    )
  } else {
    return <div><Login actionForLogin={props.actionForLogin} noteInitialization={props.noteInitialization} /></div>
  }
}

const mapStateToProps = (store) => {
  return {
    notes: store.notes,
    user: store.user
  }
}
const mapDispatchToProps = {
  noteInitialization,
  setLogin,
  actionForLogin,
  actionForLogout,
  clearNotes
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
