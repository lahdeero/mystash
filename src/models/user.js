const pool = require('../db')

// class User {
//   constructor(row) {
//     this.id = row.id
//     this.username = row.username
//     this.realname = row.realname
//     this.email = row.email
//     this.tier = row.tier
//   }
// }

createUserObject = (row) => {
  return { id: row.id, username: row.username, realname: row.realname, email: row.email, tier: row.tier }
}

const findOne = (id) => {
  const qry = `
    SELECT id, username, realname, email, github_id 
    FROM account
    WHERE id=$1`
  return pool
    .query(qry, [id])
    .then(res => {
      return createUserObject(res.rows[0])
    })
    .catch(e => console.error(e.stack))
}

const findUserByGhProfile = (profile) => {
  const qry = `
    SELECT id, username, realname, email, tier 
    FROM account
    WHERE github_id=$1`
  return pool
    .query(qry, [profile.id])
    .then(res => {
      return res.rows[0]
    })
    .catch(e => console.error(e.stack))
}

const findOrCreateUser = (profile) => {
  return findUserByGhProfile(profile).then(result => {
    if (result) {
      return createUserObject(result)
    } else {
      return createUser(profile).then(res => {
        return createUserObject(res)
      })
    }
  })
}

const createUser = (profile) => {
  const displayName = profile.displayName ? profile.displayName : profile.username
  const email = profile._json.email ? profile._json.email : `${displayName}@unknow.mail`
  const query = `
      INSERT INTO account 
      (username,realname,email,github_id,tier,register_date)
       VALUES ($1, $2, $3, $4, 1, NOW()) RETURNING *`
  const values = [profile.username, displayName, email, profile.id]

  return pool
    .connect()
    .then(client => {
      return client
        .query(query, values)
        .then(res => {
          client.release()
          return res.rows[0]
        })
        .catch(err => {
          client.release()
          console.log(err.stack)
        })
    }).catch(err => {
      console.log(err.stack)
    })
}
// return client.query(query, [profile.username, displayName, email, profile.id])

module.exports = { findOne, findUserByGhProfile, findOrCreateUser, createUser }