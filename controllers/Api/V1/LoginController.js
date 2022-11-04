const DbActions = require("../../../model/DbActions");
const LoginAuthModel = require("../../../model/LoginAuthModel");
const PasswordHasher = require("../../../helpers/PasswordHasher");
const SendWelcomeEmail = require("../../../Emails/SendWelcomeEmail");
var AuthenticationCode = require("../../../helpers/AuthenticationCode");
var SendLoginAuthMail = require("../../../Emails/SendLoginAuthMail");
var SendLoginAuthSms = require("../../../SmsManager/SendLoginAuthSms");
const ErrorHandler = require("../../../helpers/ErrorHandler");
const Generics = require("../../../helpers/Generics");
const User = require("../../../model/User");
const Settings = require("../../../model/Settings");
const DetailsforView = require("../../../helpers/ViewHelper");
const MessageType = require("../../../helpers/MessageType");
const authData = require("../../../helpers/AuthenticateLogin");
const Login = require("../../../model/LoginAuthModel");
const {
  errorStatus,
  successStatus,
} = require("../../../helpers/StatusStrings");

class LoginController {
  constructor() {
    this.SendWelcomeEmail = new SendWelcomeEmail();
    this.DbActions = new DbActions();
    this.PasswordHasher = new PasswordHasher();
    this.AuthenticationCode = new AuthenticationCode();
    this.SendLoginAuthMail = new SendLoginAuthMail();
    this.SendLoginAuthSms = new SendLoginAuthSms();
    this.LoginAuthModel = new LoginAuthModel();
    this.User = new User();
    this.MessageType = new MessageType();
    this.Settings = new Settings();
    this.Generics = new Generics();
    this.Login = new Login();
  }

  async loginAction(req, res) {
    try {
      let user = await this.DbActions.selectSingleRow("users", {
        filteringConditions: [["email", "=", req.body.email]],
      });

      if (typeof user === "undefined") {
        this.viewObject = DetailsforView(
          errorStatus,
          "Incorrect Email / Password"
        ); //get the object to be sent to view
        return res.status(400).json(this.viewObject);
      }

      if (
        !(await this.PasswordHasher.comparePassword(
          req.body.password,
          user.password
        ))
      ) {
        this.viewObject = DetailsforView(
          errorStatus,
          "Incorrect Email / Password"
        ); //get the object to be sent to view
        return res.status(400).json(this.viewObject);
      }

      if (user.email_verification === null) {
        //check if the eamil has been verified
        await this.SendWelcomeEmail.sendMail(user); //resend email to the user
        this.viewObject = DetailsforView(
          successStatus,
          "An activation email was successfully sent to your email, please activate your account by providing the code in the mail",
          { email: user.email },
          "activate_account" //so user end will know this response means user has to activate account
        ); //get the object to be sent to view
        return res.status(200).json(this.viewObject);
      }

      //check if the user account status is active
      if (user.status === "inactive") {
        this.viewObject = DetailsforView(
          "error",
          "Your account is inactive, please contact support for more details"
        ); //get the object to be sent to view
        return res.status(400).json(this.viewObject);
      }

      let activationCode = await this.AuthenticationCode.createActivationCode(
        user,
        "login_auth"
      );
      await this.SendLoginAuthMail.sendMail(user, activationCode.data);
      this.viewObject = DetailsforView(
        "success",
        "A mail bearing your login token has been sent to your email. Please provide token to login",
        {
          email: user.email,
          email_verification: user.email_verification,
          status: user.status,
        }
      );

      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  //activate the user account
  async AuthenticateLoginCode(req, res) {
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
          "login_auth",
          userObject
        );
      if (tokenAuthentication.status === false) {
        this.viewObject = DetailsforView(
          errorStatus,
          tokenAuthentication.message
        );
        return res.status(400).json(this.viewObject);
      }

      //create the jwt token
      let createdToken = await this.LoginAuthModel.secondLayerAuth(userObject);
      //delete the properties that is not supposed t be sent to view
      let userObjectForView = await this.User.returnUserForView(userObject);

      this.viewObject = DetailsforView(
        successStatus,
        "you have been successfully logged in",
        {
          token: createdToken,
          user: userObjectForView,
        }
      );
      return res.status(200).json(this.viewObject);
    } catch (e) {
      this.viewObject = DetailsforView(errorStatus, ErrorHandler(e));
      return res.status(500).json(this.viewObject);
    }
  }

  //resend an email auth code for login
  async resendEmailAuthCode(req, res) {
    try {
      let email = req.body.email;

      //select the user from the db using the supplied email address
      let userObject = await this.User.selectOneUser([["email", "=", email]]);
      if (userObject === false) {
        this.viewObject = DetailsforView(false, "User does not exist");
        return res.status(400).json(this.viewObject);
      }

      let activationCode = await this.AuthenticationCode.createActivationCode(
        userObject,
        "login_auth"
      );
      if (activationCode.status === false) {
        this.viewObject = DetailsforView(false, activationCode.message);
        return res.status(400).json(this.viewObject);
      }

      let sendMail = await this.SendLoginAuthMail.sendMail(
        userObject,
        activationCode.data
      ); //token
      if (sendMail.status === false) {
        this.viewObject = DetailsforView(false, sendMail.message);
        return res.status(400).json(this.viewObject);
      }
      // check if the user has verified phone to send login code to phone
      let successMessage =
        "A login authentication code was sent to your email address, please provide code to proceed with login";
      //send response to view
      this.viewObject = DetailsforView(successStatus, successMessage, {
        email: userObject.email,
      });
      return res.status(200).json(this.viewObject);
    } catch (err) {
      this.viewObject = DetailsforView(false, ErrorHandler(err));
      return res.status(500).json(this.viewObject);
    }
  }
}

module.exports = LoginController;
