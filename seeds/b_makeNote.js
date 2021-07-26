
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('note').del()
    .then(function () {
      // Inserts seed entries
      return knex('note').insert([
        {
          title: 'Eka note',
          content: "Noten sisältöä tässä näin",
          account_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
      ]);
    });
};
