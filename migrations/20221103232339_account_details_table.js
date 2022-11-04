exports.up = function (knex) {
  return knex.schema.createTableIfNotExists(
    "account_details",
    function (table) {
      table.increments("id").primary();
      table.string("unique_id").unique();
      table.string("user_unique_id");
      table.string("account_number", 191).unique();
      table.string("account_name", 191);
      table.string("bank", 191);
      table.decimal("amount", 13, 2);
      table.string("status", 191).defaultTo("active");
      table.dateTime("deleted_at").nullable();
      table.timestamps(true, true);
    }
  );
};

exports.down = function (knex) {};
