
exports.up = function(knex) {
  return knex.schema.createTable("account", function (table) {
    table.increments();
    table.string("username");
    table.string("github_id");
    table.string("google_id");
    table.string("facebook_id");
    table.string("password", 1024);
    table.string("realname");
    table.string("email").notNullable();
    table.integer("tier").unsigned();
    table.timestamps();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("account");
};
