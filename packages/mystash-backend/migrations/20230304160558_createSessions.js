
exports.up = function(knex) {
  return knex.schema.createTable("session", (table) => {
    table.string("sid").collate("default").notNullable()
    table.json("sess").notNullable()
    table.timestamp("expire").notNullable()
    table.index(['name', 'last_name'], 'IDX_session_expire', {
      indexType: 'FULLTEXT',
      storageEngineIndexType: 'hash',
      predicate: knex.whereNotNull('email'),
    });
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable("session")
}
