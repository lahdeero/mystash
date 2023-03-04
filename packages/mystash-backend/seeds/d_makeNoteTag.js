
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('notetag').del()
    .then(function () {
      // Inserts seed entries
      return knex('notetag').insert([
        {
          tag_id: 1,
          note_id: 1
        },
      ]);
    });
};
