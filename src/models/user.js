const pool = require('../db')
// class User {
//   constructor(username = String, password, realname, tier) {
//     this.username = username
//     this.password = password
//     this.realname = realname
//     this.tier = tier
//   }
// }

const findOne = (id) => {
  const qry = `
    SELECT id, username, realname, email, github_id 
    FROM account
    WHERE id=$1`
  return pool
    .query(qry, [id])
    .then(res => {
      res.rows[0]
    })
    .catch(e => console.error(e.stack))
}

const findUserByGhProfile = (profile) => {
  console.log('find user by github profile')
  const qry = `
    SELECT id, username, realname, email, tier 
    FROM account
    WHERE github_id=$1`
  return pool
    .query(qry, [profile.id])
    .then(res => {
      console.log(res.rows[0])
      return res.rows[0]
    })
    .catch(e => console.error(e.stack))
}

const findOrCreateUser = (profile) => {
  const promise = findUserByGhProfile(profile)
  return promise.then(res => {
    console.log('foc res', res)
    if (res) return res
    else return createUser(profile).then(res => { return res })
  })
}

const createUser = (profile) => {
  console.log('create user', profile)
  const query = `
    INSERT INTO account 
    (username,realname,email,github_id,tier,register_date)
     VALUES ($1, $2, $3, $4, 1, NOW()) RETURNING *`
  return pool.query(query, [profile.username, profile.displayName, profile._json.email, profile.id])
}

module.exports = { findOne, findUserByGhProfile, findOrCreateUser, createUser }