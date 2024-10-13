import React from 'react'
import { Children } from 'react'
import styled from 'styled-components'
import Colors from '../../layout/colors'

const NavbarWrapper = styled.div`
  background-color: ${Colors.Nav};
  display: flex;
  justify-content: space-between;
  padding: .2rem 1rem;

  @media only screen and (max-width: 600px) {
    flex-direction: column;
  }
`

const Logo = styled.div`
  position: relative;
  color: ${Colors.White};
  display: inline-block;
  font-size: 2.1rem;
  padding: 0;
  cursor: pointer;
`

const NavItemsWrapper = styled.nav`
  a {
    color: ${Colors.White};;
    text-decoration: none;

    &:hover,
    &:active,
    &.active {
      color: #cfccee;
    }
  }

  > ul {
    display: flex;
    padding: .1rem 1rem;

    @media only screen and (max-width: 600px) {
      justify-content: space-between;
    }

    li {
      margin: 0 2rem;

      @media only screen and (max-width: 600px) {
        margin: auto;
      }
    }
  }
`

const Navbar = ( { brand, children } ) => {
  const arrayChildren = Children.toArray(children)

  return (
    <NavbarWrapper>
      <Logo>
        { brand }
      </Logo>
      <NavItemsWrapper>
        <ul>
          { Children.map(arrayChildren, (child) => <li>{child}</li>) }
        </ul>
      </NavItemsWrapper>
    </NavbarWrapper>
  )
}

const NavItem = ( { children, onClick } ) => {
  return (
    <div onClick={onClick}>
      { children }
    </div>
  )
}

export { Navbar, NavItem }
