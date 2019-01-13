const systeminfoRouter = require('express').Router()
const shell = require('shelljs')

systeminfoRouter.get('/', async (req, res) => {
  // let version = []
  // version[0] = shell.exec('uname -a', { silent:true }).stdout
  // version[1] = shell.exec('/home/muistiinpanot/scripts/cpu-temp.sh', { silent:true }).stdout
  let version = ['heroku', 'rullaa']
  res.json(version)

  // var child = shell.exec('some_long_running_process', {async:true});
  // child.stdout.on('data', function(data) {
  //   res.send(data)
  // });
})




module.exports = systeminfoRouter
