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
class ProfileController {
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

  async Profile(req, res) {
    try {
      let userObject = await authData(req);
      userObject = userObject.user;

      let userDetails = await this.DbActions.selectSingleRow("users", {
        filteringConditions: [["unique_id", "=", userObject.unique_id]],
      });

      if (typeof userDetails !== "object") {
        this.viewObject = DetailsforView(errorStatus, "User does not exist");
        return res.status(400).json(this.viewObject);
      }

      this.viewObject = DetailsforView(successStatus, "", {
        user: userDetails,
      }); //get the object to be sent to view
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }
}
module.exports = ProfileController;
