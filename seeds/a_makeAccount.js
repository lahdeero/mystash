
const bcrypt = require('bcrypt')

exports.seed = async function(knex) {
  // Deletes ALL existing entries

  const saltRounds = 10
  const passwordHash = await bcrypt.hash("salasana", saltRounds)

  return knex("account").del()
    .then(function () {
      // Inserts seed entries
      return knex("account").insert([
        {
          username: "testi",
          password: passwordHash,
          email: "testi@example.org",
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });
};
