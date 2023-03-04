import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import queryString from 'query-string'
import styled from 'styled-components'
import './App.css'
import Menu from './components/Menu'
import Frontpage from './components/frontpage/Frontpage'
import List from './components/note/List'
import Show from './components/note/Show'
import Edit from './components/note/Edit'
import Upload from './components/note/Upload'
import Form from './components/note/Form'
import Footer from './components/Footer'
import Settings from './components/Settings'
import Notification from './components/Notification'
import { noteInitialization, clearNotes } from './reducers/noteReducer'
import { notify } from './reducers/notificationReducer'
import { actionForLogin, setLogin, actionForLogout } from './reducers/userReducer'
import useFilter from './hooks/useFilter'


const Content = styled.div`
  flex: 1 0 auto;
`

const App = (props) => {
  const filter = useFilter()
  const [logged, setLogged] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parsed = queryString.parse(window.location.search)
    if (parsed.token) {
      window.localStorage.setItem('MS_token', parsed.token)
    }
    const loggedUserJSON = window.localStorage.getItem('MS_token')
    window.history.pushState({ path: '/' }, 'title', '/')
    if (!logged && loggedUserJSON) {
      setLogged(true)
      init()
    }
  }, [props.user])

  // eslint-disable-next-line
  const init = async () => {
    try {
      setLoading(true)
      await props.noteInitialization()
    } catch (e) {
      props.notify(e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('MS_token')
    filter.setFilter('')
    props.clearNotes()
    props.actionForLogout()
    setLogged(false)
  }

  if (logged) {
    return (
      <>
        <Content>
          <Notification />
          <Router basename={process.env.PUBLIC_URL}>
            <div>
              <Menu filter={filter} handleLogout={handleLogout} />
              <Route exact path="/" render={() => <List filter={filter} loading={loading} />} />
              <Route path='/login' render={() => <Frontpage />} />
              <Route path='/create' render={() => <Form />} />
              <Route path='/settings' render={() => <Settings />} />
              <Route exact path='/notes/:id' component={Show} />
              <Route exact path='/notes/edit/:id' component={Edit} />
              <Route exact path='/notes/upload/:id' component={Upload} />
            </div>
          </Router>
        </Content>
        <Footer />
      </>
    )
  } else {
    return (
      <>
        <Content>
          <Frontpage actionForLogin={props.actionForLogin} init={init} />
        </Content>
        <Footer />
      </>
    )
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
  clearNotes,
  notify
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
