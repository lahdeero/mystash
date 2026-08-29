import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from './common/Navigation'
import styled from 'styled-components'

type Props = {
  filter: { setFilter: (value: string) => void }
  handleLogout: (event: any) => void
}

const MenuWrapper = styled.div`
  a {
    color: ${({ theme }) => theme.LinkMenu};
  }

  a:visited {
    color: ${({ theme }) => theme.LinkMenu};
  }
`

const Menu = (props: Props) => {
  const navigate = useNavigate()

  const clickHome = () => {
    props.filter.setFilter('')
    navigate('/')
  }

  const Logo = () => <div onClick={clickHome}>mystash</div>

  return (
    <MenuWrapper>
      <Navbar brand={<Logo />}>
        <Link to='/' onClick={() => props.filter.setFilter('')}>
          List
        </Link>
        <Link to='/create'>
          Add note
        </Link>
        <Link to='/settings'>
          Settings
        </Link>
        <Link to='/logout' onClick={props.handleLogout}>
          Logout
        </Link>
      </Navbar>
    </MenuWrapper>
  )
}

export default Menu
