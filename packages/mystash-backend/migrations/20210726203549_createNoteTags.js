
exports.up = function(knex) {
  return knex.schema.createTable("notetag", function (table) {
    table.increments();
    table.integer("note_id").unsigned();
    table.integer("tag_id").unsigned();
    table.foreign("note_id").references("note.id").onDelete("CASCADE");
    table.foreign("tag_id").references("tag.id").onDelete("CASCADE");
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("notetag");
};
