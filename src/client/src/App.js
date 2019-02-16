import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
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
import { setLogin, actionForLogout } from './reducers/userReducer'
import useFilter from './hooks/useFilter'

const App = (props) => {
  const filter = useFilter()
  const [state, setState] = useState({ user: null, navigation: 0, logged: 0 })

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedMystashappUser')
    if (state.logged === 0 && loggedUserJSON) {
      setState({
        user: JSON.parse(loggedUserJSON),
        navigation: 1
      })
      props.setLogin(state.user)
      props.noteInitialization(state.user)
    }
  })

  const handleLogout = async (event) => {
    await event.preventDefault()
    await window.localStorage.removeItem('loggedMystashappUser')
    await filter.setFilter('')
    await props.clearNotes()
    await props.actionForLogout()
    await setState({ user: null, navigation: 0, logged: 0 })
  }

  if (state.logged === 1) {
    return (
      <div>
        <Notification />
        <Router>
          <div>
            <Menu currentPage={state.navigation} filter={filter} handleLogout={handleLogout} />
            <Route exact path="/" render={() => <List Link={Link} Route={Route} filter={filter} />} />
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
    return <div><Login /></div>
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
  actionForLogout,
  clearNotes
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
