import React from 'react'
import { connect } from 'react-redux'

/* Handlechange in App */
class Filter extends React.Component {
  render () {
    const style = {
      marginBottom: 10
    }

    return (
      <div style={style}>
        <input onChange={this.props.handleChange} value={this.props.filter} />
      </div>
    )
  }
}

const mapStateToProps = (store) => {
  return {
    filter: store.filter
  }
}

const ConnectedFilter = connect(
  mapStateToProps
)(Filter)

export default ConnectedFilter
