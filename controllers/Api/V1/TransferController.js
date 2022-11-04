const authData = require("../../../helpers/AuthenticateLogin");
const AuthenticationCode = require("../../../helpers/AuthenticationCode");
const AccountVerificationLevels = require("../../../helpers/AccountVerificationLevels");
const ErrorHandler = require("../../../helpers/ErrorHandler");
const User = require("../../../model/User");
const date = require("date-and-time");
const validator = require("../../../helpers/validator");
const ErrorMessages = require("../../../helpers/ErrorMessages");
const Settings = require("../../../model/Settings");
const DetailsforView = require("../../../helpers/ViewHelper");
const Generics = require("../../../helpers/Generics");
const { sendGenericMails } = require("../../../Emails/GenericMailSender");
const GetBanks = require("../../../helpers/ApiResources/GetBanks");
const Transfers = require("../../../helpers/ApiResources/Transfers");

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
} = require("../../../helpers/TransactionTypesAndStatus");
const DbActions = require("../../../model/DbActions");

class TransferController {
  constructor() {
    this.User = new User();
    this.AuthenticationCode = new AuthenticationCode();
    this.now = new Date();
    this.Settings = new Settings();
    this.Generics = new Generics();
    this.GetBanks = new GetBanks();
    this.Transfers = new Transfers();
    this.DbActions = new DbActions();
    this.ErrorMessages = new ErrorMessages();
    this.AccountVerificationLevels = new AccountVerificationLevels();
    this.errorMessage = "";
    this.errorStatus = true;
  }

  async getBankDetails(req, res) {
    try {
      let userObject = await authData(req); //check if the jwt token is valid
      userObject = userObject.user;

      const allBanks = await this.GetBanks.getAllBanks();
      if (allBanks.status === false) {
        this.viewObject = DetailsforView(errorStatus, allBanks.message);
        return res.status(400).json(this.viewObject);
      }

      this.viewObject = DetailsforView(
        successStatus,
        allBanks.message,
        allBanks.data
      );
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  async getAcountBalance(userObject) {
    let accountDetails = await this.DbActions.selectSingleRow("users", {
      filteringConditions: [["unique_id", "=", userObject.unique_id]],
    });

    if (typeof accountDetails === "object") {
      return accountDetails.balance;
    }
    return 0;
  }

  //make a transfer to a bank account
  async makeATransfer(req, res) {
    try {
      let userObject = await authData(req); //check if the jwt token is valid
      userObject = userObject.user;

      //check if the user balace can carrr the transfer
      const userBalance = await this.getAcountBalance(userObject);
      if (userBalance < req.body.amount) {
        this.viewObject = DetailsforView(errorStatus, "Insufficient Balance");
        return res.status(400).json(this.viewObject);
      }

      const reference = await this.Generics.createUniqueId(
        "transactions",
        "unique_id"
      );

      const transferDetails = await this.Transfers.makeTransfers(
        req.body.amount,
        req.body.bank_name,
        req.body.bank_code,
        req.body.account_number,
        req.body.account_name,
        reference.data,
        req.body.narration,
        req.body.currency
      ); //send the transferr to raven

      if (transferDetails.status === false) {
        this.viewObject = DetailsforView(errorStatus, transferDetails.message);
        return res.status(400).json(this.viewObject);
      }

      //add  the transaction to table
      await this.DbActions.insertData("transactions", [
        {
          unique_id: reference.data,
          user_unique_id: userObject.unique_id,
          amount: req.body.amount,
          currency: req.body.currency,
          bank_code: req.body.bank_code,
          bank_name: req.body.bank_name,
          account_number: req.body.account_number,
          account_name: req.body.account_name,
          status: TransferPending,
          type: TransferType,
          narration: req.body.narration,
        },
      ]);

      //update the userr balance
      userObject.balance = userObject.balance - req.body.amount;
      await this.DbActions.updateData("users", {
        fields: userObject,
        filteringConditions: [["unique_id", "=", userObject.unique_id]],
      });

      this.viewObject = DetailsforView(
        successStatus,
        transferDetails.message,
        transferDetails.data
      );
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  //fetch a particular transaction
  async getATransfer(req, res) {
    try {
      let userObject = await authData(req); //check if the jwt token is valid
      userObject = userObject.user;

      const transferRef = req.params.transferRef;

      const singleTransfer = await this.Transfers.getTransfer(transferRef);

      if (singleTransfer.status === false) {
        this.viewObject = DetailsforView(errorStatus, singleTransfer.message);
        return res.status(400).json(this.viewObject);
      }

      this.viewObject = DetailsforView(
        successStatus,
        singleTransfer.message,
        singleTransfer.data
      );
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  async lookUpAnAccountNumber(req, res) {
    try {
      let userObject = await authData(req); //check if the jwt token is valid
      userObject = userObject.user;

      const accountDetails = await this.Transfers.lookUpAnAccountNumber(
        req.body.bank_code,
        req.body.account_number
      );

      if (accountDetails.status === false) {
        this.viewObject = DetailsforView(errorStatus, accountDetails.message);
        return res.status(400).json(this.viewObject);
      }

      this.viewObject = DetailsforView(successStatus, accountDetails.message, {
        fullname: accountDetails.data,
      });
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }
}

module.exports = TransferController;
//unique_id, user_unique_id, amount, currency, bank_code, bank_name, account_number, account_name, status, type, narration
