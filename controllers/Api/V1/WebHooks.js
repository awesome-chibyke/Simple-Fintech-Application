const authData = require("../../../helpers/AuthenticateLogin");
const AuthenticationCode = require("../../../helpers/AuthenticationCode");
const AccountVerificationLevels = require("../../../helpers/AccountVerificationLevels");
const User = require("../../../model/User");
const ErrorMessages = require("../../../helpers/ErrorMessages");
const UpdateWebhooks = require("../../../helpers/ApiResources/UpdateWebhooks");
const Settings = require("../../../model/Settings");
const GetBanks = require("../../../helpers/ApiResources/GetBanks");
const Transfers = require("../../../helpers/ApiResources/Transfers");
const SendTransferMail = require("../../../Emails/SendTransferMail");
const SendDepositMails = require("../../../Emails/SendDepositMails");
const DetailsforView = require("../../../helpers/ViewHelper");
const ErrorHandler = require("../../../helpers/ErrorHandler");
const {
  errorStatus,
  successStatus,
} = require("../../../helpers/StatusStrings");
const {
  TransferType,
  DepositType,
  TransferPending,
  TransferConfirmed,
  TransferFailed,
  DepositPending,
  DepositConfirmed,
  DepositFailed,
} = require("../../../helpers/TransactionTypesAndStatus");
const DbActions = require("../../../model/DbActions");

class WebHooks {
  constructor() {
    this.User = new User();
    this.AuthenticationCode = new AuthenticationCode();
    this.now = new Date();
    this.Settings = new Settings();
    this.UpdateWebhooks = new UpdateWebhooks();
    this.GetBanks = new GetBanks();
    this.SendTransferMail = new SendTransferMail();
    this.SendDepositMails = new SendDepositMails();
    this.Transfers = new Transfers();
    this.DbActions = new DbActions();
    this.ErrorMessages = new ErrorMessages();
    this.AccountVerificationLevels = new AccountVerificationLevels();
    this.errorMessage = "";
    this.errorStatus = true;
  }

  async reUpdateSenderBalance(userObject, transactionObject) {
    //select the sender account details
    userObject.balance + userObject.balance + transactionObject.amount;
    await this.DbActions.updateData("users", {
      fields: userObject,
      filteringConditions: [["unique_id", "=", userObject.unique_id]],
    });
  }

  async updateAndStoreDepositDetails(checkForAccountExistence, payload) {
    //update the sender account balance
    await this.DbActions.updateData("account_details", {
      fields: checkForAccountExistence,
      filteringConditions: [
        ["unique_id", "=", checkForAccountExistence.unique_id],
      ],
    });

    //if it does, create a deposit for that user and increase his balance in success case, send a notification
    await this.DbActions.insertData("transactions", [
      {
        unique_id: reference.data,
        user_unique_id: checkForAccountExistence.user_unique_id,
        amount: payload.meta.amount,
        currency: payload.meta.currency,
        bank_code: "none",
        bank_name: payload.meta.account_bank,
        account_number: payload.meta.account_number,
        account_name: payload.meta.account_name,
        status: DepositConfirmed,
        type: DepositType,
        narration: payload.meta.narration,
      },
    ]);
  }

  //send a mail notiffication to the user about this transfer
  async sendMailToSender(userObject, transactionObject, status) {
    this.SendTransferMail.sendMail(userObject, {
      balance: userObject.amount,
      amount: transactionObject.amount,
      bank: transactionObject.bank_name,
      account_number: transactionObject.account_number,
      account_name: transactionObject.account_name,
      status: status,
    });
  }

  //send a credit email to the sender, in a case where the transfer failed and his money sent back to him
  async sendCreditMailForSender(userObject, payload) {
    this.SendDepositMails.sendMail(userObject, {
      balance: userObject.balance,
      amount: payload.meta.amount,
    });
  }

  async ProcessTransferHook(req, res) {
    // If you specified a secret hash, check for the signature
    const secretHash = process.env.RAVEN_WEBHOOK_SECRET;
    const signature = req.body.secret;
    if (!signature || signature !== secretHash) {
      // This request isn't from Flutterwave; discard
      res.status(401).end();
    }
    const payload = req.body;
    // It's a good idea to log all received events.
    //log(payload);

    if (payload.type === "collection") {
      //run a select on the transaction table with the reference
      let transactionObject = await this.DbActions.selectSingleRow(
        "transactions",
        {
          filteringConditions: [
            ["account_number", "=", payload.account_number],
          ],
        }
      );

      if (typeof transactionObject === "object") {
        if (transactionObject.status === DepositConfirmed) {
          return res.status(200).end();
        }

        //update the transaction to success
        transactionObject.status = DepositConfirmed;

        await this.DbActions.updateData("transactions", {
          fields: transactionObject,
          filteringConditions: [
            ["unique_id", "=", transactionObject.unique_id],
          ],
        });

        //update the user balance
        let userObject = await this.DbActions.selectSingleRow("users", {
          filteringConditions: [
            ["unique_id", "=", transactionObject.user_unique_id],
          ],
        });
        if (typeof transactionObject === "object") {
          userObject.balance = userObject.balance + payload.amount;
          await this.DbActions.updateData("users", {
            fields: userObject,
            filteringConditions: [["unique_id", "=", userObject.unique_id]],
          });

          //send mail
          await this.sendCreditMailForSender(userObject, payload);
        }
      }
      return res.status(200).end();
    }

    //for transfer
    if (payload.type === "transfer") {
      //run a select on the transaction table with the reference
      let transactionObject = await this.DbActions.selectSingleRow(
        "transactions",
        {
          filteringConditions: [["unique_id", "=", payload.merchant_ref]],
        }
      );

      if (typeof transactionObject === "object") {
        if (
          transactionObject.status === TransferConfirmed ||
          transactionObject.status === TransferFailed
        ) {
          return res.status(200).end();
        }

        let userObject = await this.DbActions.selectSingleRow("users", {
          filteringConditions: [
            ["unique_id", "=", transactionObject.user_unique_id],
          ],
        });

        if (typeof userObject === "object") {
          //a vaulue was returned
          //change the status of the transfer to confirmed after checking transfer status
          if (payload.status === "successful") {
            transactionObject.status = TransferConfirmed;

            //send a transfer notification to the user
            await this.sendMailToSender(
              userObject,
              transactionObject,
              transactionObject.status
            );
          }
          //if failed, get the transfer amount add back to that of the sender
          //send a notification
          if (payload.status === "failed") {
            transactionObject.status = TransferFailed;

            //add the money back to a sender account
            await this.DbActions.updateData("users", {
              fields: { balance: userObject.balance + payload.meta.amount },
              filteringConditions: [["unique_id", "=", userObject.unique_id]],
            });
            await this.sendCreditMailForSender(userObject, payload);
          }
        }

        //update the transfer to confirmed or failed
        await this.DbActions.updateData("transactions", {
          fields: transactionObject,
          filteringConditions: [
            ["unique_id", "=", transactionObject.unique_id],
          ],
        });
      }

      // Do something (that doesn't take too long) with the payload
      return res.status(200).end();
    }
  }

  async updatewebHook(req, res) {
    try {
      let userObject = await authData(req); //check if the jwt token is valid
      userObject = userObject.user;

      const webHookUpdate = await this.UpdateWebhooks.updateWebHookDetails(
        req.body.webhook_url,
        req.body.webhook_secret_key
      );

      if (webHookUpdate.status === false) {
        this.viewObject = DetailsforView(errorStatus, webHookUpdate.message);
        return res.status(400).json(this.viewObject);
      }

      this.viewObject = DetailsforView(
        successStatus,
        webHookUpdate.message,
        webHookUpdate.data
      );
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }
}
module.exports = WebHooks;
