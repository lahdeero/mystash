import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Row, Col, CardPanel } from 'react-materialize'

class Settings extends Component {
  constructor(props) {
    super(props)
    this.state = {
        username: '',
        realname: '',
        tier: '',
        email: '',
    }
  }

  componentWillMount() {
    this.setState({
        username: this.props.user.username,
        realname: this.props.user.realname,
        tier: this.props.user.tier === 1 ? 'User' : 'Unknown',
        email: this.props.user.email
    })
  }

  render() {
    return (
      <div className="container">
        <Row>
          <Col s={12} m={5}>
            <CardPanel className="red accent-2 black-text">
              <span>Currently can't change your information</span>
            </CardPanel>
          </Col>
          <Col s={12} m={7}>
            <CardPanel className="blue lighten-3 black-text">
                <Row>
                  <Col>Username: </Col>
                  <Col>{this.state.username}</Col>
                </Row>
                <Row>
                  <Col>Name: </Col>
                  <Col>{this.state.realname}</Col>
                </Row>
                <Row>
                  <Col>Level: </Col>
                  <Col>{this.state.tier}</Col>
                </Row>
                <Row>
                  <Col>Email: </Col>
                  <Col>{this.state.email}</Col>
                </Row>
              </CardPanel>
          </Col>
        </Row>
	  </div>
	)
  }
}

const mapStateToProps = (store) => {
	return {
		user: store.user
	}
}

const ConnectedSettings = connect(
	mapStateToProps
)(Settings)

export default ConnectedSettings