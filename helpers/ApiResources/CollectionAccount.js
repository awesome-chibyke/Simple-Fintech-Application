const fetch = require("node-fetch");

class CollectionAccount {
  //create a wallet api
  async createCollectionAccount(first_name, last_name, phone, amount, email) {
    let body = { first_name, last_name, phone, amount, email };

    const url =
      "https://integrations.getravenbank.com/v1/pwbt/generate_account";
    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.RAVEN_SECRET}`,
      },
    };

    const request = await fetch(url, options);
    const returnValue = await request.json();
    if (returnValue.status === "success") {
      return { status: true, message: "", data: returnValue.data };
    } else {
      return { status: false, message: returnValue.message, data: {} };
    }
  }
}

module.exports = CollectionAccount;
