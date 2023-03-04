
exports.up = function(knex) {
  return knex.schema.createTable("backupnote", function (table) {
    table.increments();
    table.integer("note_id").unsigned();
    table.integer("account_id").unsigned();
    table.string("title");
    table.text("content");
    table.timestamps();
    table.foreign("account_id").references("account.id").onDelete("CASCADE");
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("backupnote");
};
