import { Link, useNavigate } from 'react-router-dom'
import { connect } from 'react-redux'
import Filter from './Filter'
import { Navbar } from './common/Navigation'

type Props = {
  filter: { setFilter: (value: string) => void }
  handleLogout: (event: any) => void
}

const Menu = (props: Props) => {
  const navigate = useNavigate()

  const clickHome = () => {
    props.filter.setFilter('')
    navigate('/')
  }

  const Logo = () => <div onClick={clickHome}>mystash</div>

  return (
    <div>
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
      <Filter filter={props.filter} />
    </div>
  )
}

export default connect(null)(Menu)
