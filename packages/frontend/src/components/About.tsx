import { useState, useEffect } from 'react'
import getAll from '../services/systemService'

const About = () => {
  const [sysinfo, setSysinfo] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    getAll().then(data => {
      if (isMounted) {
        setSysinfo(data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <h2>About</h2>
      <br />
      {sysinfo[0]}
      <br />
      {sysinfo[1]}
    </div>
  )
}

export default About
