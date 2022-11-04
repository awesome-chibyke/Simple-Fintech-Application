exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.decimal("balance", 13, 2).defaultTo(0);
  });
};

exports.down = function (knex) {};
