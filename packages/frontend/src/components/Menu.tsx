import { Link, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Filter from './Filter'
import { Navbar, NavItem } from './common/Navigation'

type Props = {
  filter: { setFilter: (value: string) => void }
  handleLogout: (event: any) => void
}

const Menu = (props: Props) => {
  const history = useHistory()

  const clickHome = () => {
    props.filter.setFilter('')
    history.push('/')
  }

  const Logo = () => <div onClick={clickHome}>mystash</div>

  return (
    <div>
      <Navbar brand={<Logo />}>
        <Link to='/'>
          <NavItem onClick={() => props.filter.setFilter('')}>List</NavItem>
        </Link>
        <Link to='/create'>
          <NavItem onClick={undefined}>Add note</NavItem>
        </Link>
        <Link to='/settings'>
          <NavItem onClick={undefined}>Settings</NavItem>
        </Link>
        <Link to='/logout'>
          <NavItem onClick={props.handleLogout}>Logout</NavItem>
        </Link>
      </Navbar>
      <Filter filter={props.filter} />
    </div>
  )
}

export default connect(null)(Menu)
