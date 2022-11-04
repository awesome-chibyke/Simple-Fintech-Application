const fetch = require("node-fetch");

class GetBanks {
  //create a wallet api
  async getAllBanks() {
    const url = "https://integrations.getravenbank.com/v1/banks";
    const options = {
      method: "GET",
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

module.exports = GetBanks;
