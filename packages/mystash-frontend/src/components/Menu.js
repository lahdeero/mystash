import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Filter from './Filter'
import { Navbar, NavItem} from './common/Navigation'

const Menu = (props) => {
  return (
    <div>
      <Navbar brand={Logo(props)} href='#!' right>
        <Link to='/'>
          <NavItem eventkey={1} onClick={() => props.filter.setFilter('')}>List</NavItem>
        </Link >
        <Link to='/create'>
          <NavItem eventkey={2}>Add note</NavItem>
        </Link >
        <Link to='/settings'>
          <NavItem eventkey={3}>Settings</NavItem>
        </Link >
        <Link to='/logout'>
          <NavItem onClick={props.handleLogout}>Logout</NavItem>
        </Link >
      </Navbar>
      <Filter filter={props.filter} />
    </div >
  )
}

const Logo = (props) => {
  const clickHome = (props) => {
    props.filter.setFilter('')
    props.history.push('/')
  }

  return (
    <div onClick={() => clickHome(props)}>
      mystash
    </div>
  )
}

export default withRouter(connect(null)(Menu))
