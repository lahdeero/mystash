import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'
import '../../App.css'

const Frontpage = ({ actionForLogin, _init }: any) => {
  const [pageIsLogin, setPageIsLogin] = useState(true)
  const togglePage = async (event: any) => {
    event.preventDefault()
    setPageIsLogin(!pageIsLogin)
  }

  return (
    <>
      { pageIsLogin }
      { pageIsLogin && <Login togglePage={togglePage} actionForLogin={actionForLogin} /> }
      { !pageIsLogin && <Register togglePage={togglePage}/> }
    </>
  )
}

export default Frontpage
