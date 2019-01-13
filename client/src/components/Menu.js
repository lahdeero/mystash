import React from 'react'
import { Navbar, NavItem, Icon } from 'react-materialize'
import { IndexLinkContainer } from 'react-router-bootstrap'
import { Redirect } from 'react-router-dom'

import Filter from './Filter'

class Menu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentPage: 1,
      handleSelect: props.handleSelect,
      redirect: false
    }
  }

  render () {
    if (this.state.redirect) {
      return <div><Redirect to='/login' /></div>
    }

    return (
      <div>
        <Navbar className='indigo' brand='my-stash' right>
          <IndexLinkContainer to='/create'>
            <NavItem eventkey={2}><Icon>note_add</Icon></NavItem>
          </IndexLinkContainer>
          <IndexLinkContainer to='/settings'>
            <NavItem eventkey={3}><Icon>settings</Icon></NavItem>
          </IndexLinkContainer>
          <IndexLinkContainer to='/logout'>
            <NavItem onClick={this.props.handleLogout}><Icon>logout</Icon></NavItem>
          </IndexLinkContainer>
        </Navbar>
        <Filter handleChange={this.props.handleChange} />
      </div>
    )
  }
}

export default Menu
