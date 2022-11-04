exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.string("account_number_status").nullable();
  });
};

exports.down = function (knex) {};
