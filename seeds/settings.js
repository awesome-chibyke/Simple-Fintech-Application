var Generics = require("../helpers/Generics");
Generics = new Generics();
const date = require("date-and-time");

exports.seed = async function (knex) {
  //create the unique unique_id
  var uniqueIdDetails = await Generics.createUniqueId("settings", "unique_id");
  if (uniqueIdDetails.status === false) {
    return "failed";
  }

  const now = new Date();
  let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");
  // Deletes ALL existing entries
  return knex("settings")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("settings").insert([
        {
          id: 1,
          unique_id: uniqueIdDetails.data,
          site_name: "Fintech App",
          address1: "No 3 Kenyetta Street Uwani",
          address2: "No 3 Kenyetta Street Uwani",
          email1: "info@fintechapp.com",
          site_url: "fintechapp.com",
          email2: "support@fintechapp.com",
          logo_url: "http://fintechapp.com/login",
          facebook: "http://fintechapp.com/login",
          instagram: "http://fintechapp.com/login",
          phone1: 364735475473,
          phone2: 78565656,
          least_withdrawable_amount: 100,
          no_of_days_to_review: null,
          linkedin: "",
          total_projects: "",
          address_3: "",
          address4: "",
          created_at: currenctDate,
          updated_at: currenctDate,
        },
      ]);
    });
};
