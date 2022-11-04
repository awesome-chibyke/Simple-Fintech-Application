const DetailsforView = require("../../../helpers/ViewHelper");
const AuthenticationCode = require("../../../helpers/AuthenticationCode");
const ErrorHandler = require("../../../helpers/ErrorHandler");
const User = require("../../../model/User");
const LoginAuthModel = require("../../../model/LoginAuthModel");
const date = require("date-and-time");
const SendWelcomeEmailAfterActivation = require("../../../Emails/SendWelcomeEmailAfterActivation");
const AccountVerificationLevels = require("../../../helpers/AccountVerificationLevels");
const CollectionAccount = require("../../../helpers/ApiResources/CollectionAccount");
const DbActions = require("../../../model/DbActions");
const Generics = require("../../../helpers/Generics");
const {
  errorStatus,
  successStatus,
} = require("../../../helpers/StatusStrings");

class AccountActivation {
  constructor() {
    this.now = new Date();
    this.AuthenticationCode = new AuthenticationCode();
    this.Generics = new Generics();
    this.DbActions = new DbActions();
    this.User = new User();
    this.CollectionAccount = new CollectionAccount();
    this.LoginAuthModel = new LoginAuthModel();
    this.AccountVerificationLevels = new AccountVerificationLevels();
    this.SendWelcomeEmailAfterActivation =
      new SendWelcomeEmailAfterActivation();
  }

  //activate the user account
  async ActivateAccount(req, res) {
    try {
      //select the user involved
      let userObject = await this.User.selectOneUser([
        ["email", "=", req.body.email],
      ]);
      if (userObject === false) {
        this.viewObject = DetailsforView(
          "error",
          "Invalid User details supplied"
        );
        return res.status(400).json(this.viewObject);
      }

      //verify the token provided
      let tokenAuthentication =
        await this.AuthenticationCode.verifyTokenValidity(
          req.body.token,
          "account_activation",
          userObject
        );
      if (tokenAuthentication.status === false) {
        this.viewObject = DetailsforView(
          errorStatus,
          tokenAuthentication.message
        );
        return res.status(400).json(this.viewObject);
      }

      //confirm the user account
      let currenctDate = date.format(this.now, "YYYY-MM-DD HH:mm:ss");
      await this.User.updateUser({
        unique_id: userObject.unique_id,
        email_verification: currenctDate,
        updated_at: currenctDate,
      });

      //send mail when account details is successfully created
      this.SendWelcomeEmailAfterActivation.sendMail(userObject, {});
      //send success response
      this.viewObject = DetailsforView(
        successStatus,
        "Account activation was successful, Please login to continue"
      );
      return res.status(200).json(this.viewObject);

      //send the
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(200).json(this.viewObject);
    }
  }
}

module.exports = AccountActivation;
