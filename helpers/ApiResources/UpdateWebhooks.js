const fetch = require("node-fetch");
class UpdateWebhooks {
  //create a wallet api
  async updateWebHookDetails(webhook_url, webhook_secret_key) {
    const url = "https://integrations.getravenbank.com/v1/webhooks/update";

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.RAVEN_SECRET}`,
      },
      body: JSON.stringify({
        webhook_url: webhook_url,
        webhook_secret_key: webhook_secret_key,
      }),
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

module.exports = UpdateWebhooks;
