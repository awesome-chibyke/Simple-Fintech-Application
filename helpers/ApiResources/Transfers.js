const fetch = require("node-fetch");

class Transfers {
  //create a wallet api
  async makeTransfers(
    amount,
    bank_name,
    bank_code,
    account_number,
    account_name,
    reference,
    narration = "",
    currency = "NGN"
  ) {
    const url = "https://integrations.getravenbank.com/v1/transfers/create";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.RAVEN_SECRET}`,
      },
      body: JSON.stringify({
        amount: amount,
        bank: bank_name,
        bank_code: bank_code,
        currency: currency,
        account_number: account_number,
        account_name: account_name,
        reference: reference,
        narration: narration,
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

  async getTransfer(transferRef) {
    const url = `https://integrations.getravenbank.com/v1/get-transfer?trx_ref=${transferRef}`;
    const options = { method: "GET", headers: { accept: "application/json" } };

    const request = await fetch(url, options);

    const returnValue = await request.json();
    if (returnValue.status === "success") {
      return { status: true, message: "", data: returnValue.data };
    } else {
      return { status: false, message: returnValue.message, data: {} };
    }
  }

  async lookUpAnAccountNumber(bank_code, account_number) {
    const url =
      "https://integrations.getravenbank.com/v1/account_number_lookup";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.RAVEN_SECRET}`,
      },
      body: JSON.stringify({ bank: bank_code, account_number: account_number }),
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

module.exports = Transfers;
