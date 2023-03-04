
exports.up = function(knex) {
  return knex.schema.createTable("note", function (table) {
    table.increments();
    table.string("title");
    table.text("content");
    table.timestamps();
    table.integer("account_id");
    table.foreign("account_id").references("account.id").onDelete("CASCADE");
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("note");
};
