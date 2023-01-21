
exports.up = function(knex) {
  return knex.schema.createTable("file", (table) => {
    table.increments();
    table.string("fieldname");
    table.string("originalname");
    table.string("encoding");
    table.string("mimetype");
    table.string("size").unsigned();
    table.string("destination").notNullable();
    table.string("filename");
    table.string("path");
    table.string("buffer");
    table.integer("note_id");
    table.integer("account_id");
    table.timestamps();
    table.foreign("note_id").references("note.id").onDelete("SET NULL");
    table.foreign("account_id").references("account.id").onDelete("SET NULL");
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("file");
};
