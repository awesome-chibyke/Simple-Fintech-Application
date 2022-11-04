const DetailsforView = require("../../../helpers/ViewHelper");
const PasswordHasher = require("../../../helpers/PasswordHasher");
const ErrorMessages = require("../../../helpers/ErrorMessages");
const Generics = require("../../../helpers/Generics");
const AuthenticationCode = require("../../../helpers/AuthenticationCode");
const date = require("date-and-time");
const DbActions = require("../../../model/DbActions");
const SendWelcomeEmail = require("../../../Emails/SendWelcomeEmail");
const ErrorHandler = require("../../../helpers/ErrorHandler");
const User = require("../../../model/User");
const Currency = require("../../../model/Currency");
const {
  errorStatus,
  successStatus,
} = require("../../../helpers/StatusStrings");

//instantiation
class RegisterController {
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

  async checkForUniqueValue(DbActionsObject, columnName, value) {
    //to check if the regitration email is unique
    let userDetails = await DbActionsObject.selectSingleRow("users", {
      filteringConditions: [[columnName, "=", value]],
    });

    if (typeof userDetails === "object") {
      return false;
    }
    return true;
  }

  async register(req, res) {
    try {
      if (
        (await this.checkForUniqueValue(
          this.DbActions,
          "email",
          req.body.email
        )) === false
      ) {
        this.viewObject = DetailsforView(errorStatus, "Email address exists"); //get the object to be sent to view
        return res.status(400).json(this.viewObject);
      } //check if the email address is unique

      if (
        (await this.checkForUniqueValue(
          this.DbActions,
          "email",
          req.body.phone
        )) === false
      ) {
        this.viewObject = DetailsforView(errorStatus, "Phone number exists"); //get the object to be sent to view
        return res.status(400).json(this.viewObject);
      } //check if the phone number is unqiue

      let uniqueIdDetails = await this.Generics.createUniqueId(
        "users",
        "unique_id"
      ); //creates a unique id for this user which can serve as a primary key for the user table

      if (uniqueIdDetails.status === false) {
        throw new Error(uniqueIdDetails.message);
      }

      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

      let hashedPassword = await this.passwordController.hashPassword(
        req.body.password
      );

      //insert the values into the db
      var insertValue = await this.DbActions.insertData("users", [
        {
          unique_id: uniqueIdDetails.data,
          email: req.body.email,
          password: hashedPassword,
          fullname: req.body.fullname,
          phone: req.body.phone,
          created_at: currenctDate,
          updated_at: currenctDate,
        },
      ]);

      let userObject = await this.User.selectOneUser([
        ["unique_id", "=", uniqueIdDetails.data],
      ]);

      await this.SendWelcomeEmail.sendMail(userObject); //send an email to the user to activate their account

      this.viewObject = DetailsforView(
        successStatus,
        "Registration was successful. An account activation code has been sent to your email. please supply code to activate account.",
        { email: req.body.email }
      ); //get the object to be sent to view
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  async resendActivationEmail(req, res) {
    //resens activation email
    try {
      let email = req.body.email;

      let userObject = await this.User.selectOneUser([["email", "=", email]]);
      if (userObject === false) {
        this.viewObject = DetailsforView(errorStatus, "User not found"); //get the object to be sent to view
        return res.status(400).json(this.viewObject);
      }

      let sendMail = await this.SendWelcomeEmail.sendMail(userObject);

      this.viewObject = DetailsforView(
        successStatus,
        "An account activation code has been sent to your email. please supply code to activate account.",
        { email: req.body.email }
      ); //get the object to be sent to view
      return res.status(200).json(this.viewObject);
    } catch (err) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }
}
module.exports = RegisterController;
