const DetailsforView = require("../../../helpers/ViewHelper");
const PasswordHasher = require("../../../helpers/PasswordHasher");
const ErrorMessages = require("../../../helpers/ErrorMessages");
const Generics = require("../../../helpers/Generics");
const AuthenticationCode = require("../../../helpers/AuthenticationCode");
const DbActions = require("../../../model/DbActions");
const SendWelcomeEmail = require("../../../Emails/SendWelcomeEmail");
const ErrorHandler = require("../../../helpers/ErrorHandler");
const User = require("../../../model/User");
const Currency = require("../../../model/Currency");
const authData = require("../../../helpers/AuthenticateLogin");
const {
  errorStatus,
  successStatus,
} = require("../../../helpers/StatusStrings");
const {
  TransferType,
  DepositType,
} = require("../../../helpers/TransactionTypesAndStatus");

//instantiation
class TransactionHistory {
  constructor() {
    this.SendWelcomeEmail = new SendWelcomeEmail();
    this.DbActions = new DbActions();
    this.AuthenticationCode = new AuthenticationCode();
    this.Generics = new Generics();
    this.passwordController = new PasswordHasher();
    this.User = new User();
    this.Currency = new Currency();
    this.ErrorMessages = new ErrorMessages();
    this.viewObject = {};
  }

  async Deposits() {
    try {
      let userObject = await authData(req);
      userObject = userObject.user;

      let depostTransactions = await this.DbActions.selectAllData(
        "transactions",
        {
          filteringConditions: [
            ["type", "=", DepositType],
            ["user_unique_id", "=", userObject.unique_id],
          ],
        }
      );

      this.viewObject = DetailsforView(successStatus, "", {
        depostTransactions: depostTransactions,
      }); //get the object to be sent to view
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  async Transfers() {
    try {
      let userObject = await authData(req);
      userObject = userObject.user;
      let transferTransactions = await this.DbActions.selectAllData(
        "transactions",
        {
          filteringConditions: [
            ["type", "=", TransferType],
            ["user_unique_id", "=", userObject.unique_id],
          ],
        }
      );

      this.viewObject = DetailsforView(successStatus, "", {
        transferTransactions: transferTransactions,
      }); //get the object to be sent to view
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  async Transactions() {
    try {
      let userObject = await authData(req);
      userObject = userObject.user;
      let transactions = await this.DbActions.selectAllData("transactions", {
        filteringConditions: [["user_unique_id", "=", userObject.unique_id]],
      });

      this.viewObject = DetailsforView(successStatus, "", {
        transactions: transactions,
      }); //get the object to be sent to view
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }
}
module.exports = TransactionHistory;
