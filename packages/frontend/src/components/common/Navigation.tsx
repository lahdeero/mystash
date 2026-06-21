import { Children } from 'react'
import styled from 'styled-components'

type NavbarProps = {
  brand: any
  href?: string
  right?: boolean
  children?: React.ReactNode
}

const NavbarWrapper = styled.div`
  background-color: ${({ theme }) => theme.Nav};
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 1rem;

  @media only screen and (max-width: 600px) {
    flex-direction: column;
  }
`

const Logo = styled.div`
  position: relative;
  color: ${({ theme }) => theme.ButtonText};
  display: inline-block;
  font-size: 2.1rem;
  padding: 0;
  cursor: pointer;
`

const NavItemsWrapper = styled.nav`
  a {
    color: ${({ theme }) => theme.ButtonText};
    text-decoration: none;

    &:hover,
    &:active,
    &.active {
      color: #cfccee;
    }
  }

  > ul {
    display: flex;
    padding: 0.1rem 1rem;

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

const Navbar = ({ brand, children }: NavbarProps) => {
  const arrayChildren = Children.toArray(children)

  return (
    <NavbarWrapper>
      <Logo>{brand}</Logo>
      <NavItemsWrapper>
        <ul>
          {Children.map(arrayChildren, (child) => (
            <li>{child}</li>
          ))}
        </ul>
      </NavItemsWrapper>
    </NavbarWrapper>
  )
}

export { Navbar }
