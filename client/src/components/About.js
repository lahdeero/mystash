import React, { Component } from 'react';
import SystemService from '../services/SystemService'

class About extends Component {
  constructor(props) {
    super(props)
    this.state = {
			isMounted: false,
			sysinfo: [],
    }
  }

	async componentWillMount(): Promise<void> {
    SystemService.getAll().then(sysinfo =>
			this.setState({ 
				isMounted:true,
				sysinfo 
			}) 
	)}
	async componentWillUnmount(): Promise<void> {
		this.setState({ isMounted: false })
	}
	render() {
  	return (
     <div>
			<h2>About</h2>
			<br />
			{this.state.sysinfo[0]}
			<br />
			{this.state.sysinfo[1]}
		 </div>
	  )
	}
}

export default About
