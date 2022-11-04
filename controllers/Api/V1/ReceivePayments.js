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
const { sendGenericMails } = require("../../../Emails/GenericMailSender");
const GetBanks = require("../../../helpers/ApiResources/GetBanks");
const Transfers = require("../../../helpers/ApiResources/Transfers");
const CollectionAccount = require("../../../helpers/ApiResources/CollectionAccount");
const Generics = require("../../../helpers/Generics");

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
} = require("../../../helpers/TransactionTypesAndStatus");
const DbActions = require("../../../model/DbActions");

class ReceivePayments {
  constructor() {
    this.User = new User();
    this.AuthenticationCode = new AuthenticationCode();
    this.now = new Date();
    this.Settings = new Settings();
    this.CollectionAccount = new CollectionAccount();
    this.GetBanks = new GetBanks();
    this.Generics = new Generics();
    this.Transfers = new Transfers();
    this.DbActions = new DbActions();
    this.ErrorMessages = new ErrorMessages();
    this.AccountVerificationLevels = new AccountVerificationLevels();
    this.errorMessage = "";
    this.errorStatus = true;
  }

  async createTransaction(req, res) {
    try {
      let userObject = await authData(req);
      userObject = userObject.user;
      const splittedName = userObject.fullname.split(" ");
      //create account number
      const AccountDetails =
        await this.CollectionAccount.createCollectionAccount(
          splittedName[0],
          splittedName[1],
          userObject.phone,
          req.body.amount,
          userObject.email
        );
      if (AccountDetails.status === false) {
        return false;
      }
      //currency
      const uniqueIdDetails = await this.Generics.createUniqueId(
        "account_details",
        "unique_id"
      );
      const { account_number, account_name, bank, amount } =
        AccountDetails.data;
      //save the data to acount db
      await this.DbActions.insertData("transactions", [
        {
          unique_id: uniqueIdDetails.data,
          user_unique_id: userObject.unique_id,
          amount: amount,
          currency: req.body.currency,
          bank_name: bank,
          account_number: account_number,
          account_name: account_name,
          status: DepositPending,
          type: DepositType,
        },
      ]);

      this.viewObject = DetailsforView(successStatus, "", AccountDetails.data);
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }
}

module.exports = ReceivePayments;
//unique_id, user_unique_id, amount, currency, bank_code, bank_name, account_number, account_name, status, type, narration
