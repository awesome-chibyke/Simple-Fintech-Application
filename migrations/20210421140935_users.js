exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("users", function (table) {
    table.increments("id").primary();
    table.string("unique_id").unique();
    table.string("email").unique();
    table.string("password");
    table.string("email_verification", 191).nullable();
    table.string("fullname", 191);
    table.string("phone", 191);
    table.string("country_code", 191).nullable();
    table.string("status", 191).defaultTo("active");
    table.dateTime("deleted_at").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {};
