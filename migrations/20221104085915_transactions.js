exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("transactions", function (table) {
    table.increments("id").primary();
    table.string("unique_id").unique();
    table.string("user_unique_id");
    table.decimal("amount", 13, 2);
    table.string("currency", 191);
    table.string("bank_code", 191);
    table.string("bank_name", 191);
    table.string("account_number", 191).unique();
    table.string("account_name", 191);
    table.string("status", 191);
    table.string("type", 191);
    table.text("narration");
    table.dateTime("deleted_at").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {};
