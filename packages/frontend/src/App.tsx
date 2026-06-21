import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import queryString from 'query-string'
import { connect } from 'react-redux'
import styled, { ThemeProvider } from 'styled-components'
import './App.css'
import Frontpage from './components/frontpage/Frontpage'
import Show from './components/note/Show'
import Edit from './components/note/Edit'
import Upload from './components/note/Upload'
import Footer from './components/Footer'
import Notification from './components/Notification'
import Menu from './components/Menu'
import { noteInitialization, clearNotes } from './reducers/noteReducer'
import { notify } from './reducers/notificationReducer'
import { actionForLogin, actionForLogout } from './reducers/userReducer'
import useFilter from './hooks/useFilter'
import loginService from './services/loginService'
import List from './components/note/List'
import Create from './components/note/Create'
import Settings from './components/Settings'
import { Theme, themes } from './layout/colors'

const Content = styled.div`
  flex: 1 0 auto;
  background-color: ${({ theme }) => theme.Background};
  color: ${({ theme }) => theme.Text};
`

const MS_TOKEN = 'MS_token'
const MS_CODE = 'MS_code'
const MS_THEME = 'MS_theme'

const App = (props: any) => {
  const filter = useFilter()
  const [logged, setLogged] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentTheme, setCurrentTheme] = useState(Theme.Light)

  const getToken = async (code: any) => {
    const { token, user: _user } = await loginService.githubVerify(code)
    window.localStorage.setItem(MS_TOKEN, token)
  }

  useEffect(() => {
    const parsed = queryString.parse(window.location.search)
    const callback = () => {
      const loggedUserJSON = window.localStorage.getItem(MS_TOKEN)
      window.history.pushState({ path: '/' }, 'title', '/')
      if (!logged && loggedUserJSON) {
        setLogged(true)
        init()
      }
      const theme = window.localStorage.getItem(MS_THEME) as Theme
      if (Object.values(Theme).includes(theme)) {
        setCurrentTheme(theme)
      }
    }
    if (parsed.token) {
      window.localStorage.setItem(MS_TOKEN, JSON.stringify(parsed.token))
      callback()
    } else if (parsed.code) {
      setLoading(true)
      getToken(parsed.code).then(callback)
      setLoading(false)
      return
    }
    callback()
  }, [props.user])

  useEffect(() => {
    window.localStorage.setItem(MS_THEME, currentTheme)
  }, [currentTheme])

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

  const handleLogout = (event: any) => {
    event.preventDefault()
    window.localStorage.removeItem(MS_TOKEN)
    window.localStorage.removeItem(MS_CODE)
    filter.setFilter('')
    props.clearNotes()
    props.actionForLogout()
    setLogged(false)
  }

  if (logged) {
    return (
      <>
        <ThemeProvider theme={themes[currentTheme]}>
          <Content>
            <Notification />
            <Menu filter={filter} handleLogout={handleLogout} />
            <Routes>
              <Route
                path="/"
                element={<List filter={filter} loading={loading} />}
              />
              <Route path="/login" element={<Frontpage />} />
              <Route path="/create" element={<Create />} />
              <Route
                path="/settings"
                element={
                  <Settings
                    currentTheme={currentTheme}
                    setCurrentTheme={setCurrentTheme}
                  />
                }
              />
              <Route path="/notes/:id" element={<Show />} />
              <Route path="/notes/edit/:id" element={<Edit />} />
              <Route path="/notes/upload/:id" element={<Upload />} />
            </Routes>
          </Content>
          <Footer />
        </ThemeProvider>
      </>
    )
  } else {
    return (
      <>
        <Content>
          <Notification />
          <Frontpage actionForLogin={props.actionForLogin} init={init} />
        </Content>
        <Footer />
      </>
    )
  }
}

const mapStateToProps = (store: any) => ({
  notes: store.notes,
  user: store.user,
})

const mapDispatchToProps = {
  noteInitialization,
  actionForLogin,
  actionForLogout,
  clearNotes,
  notify,
}
export default connect(mapStateToProps, mapDispatchToProps)(App)
