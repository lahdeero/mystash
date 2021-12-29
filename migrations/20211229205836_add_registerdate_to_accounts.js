
exports.up = function(knex) {
  return knex.schema.table("account", function(t) {
    t.date("register_date");
});
};

exports.down = function(knex) {
  return knex.schema.table("account", function(t) {
    t.dropColumn("register_date");
});
};
