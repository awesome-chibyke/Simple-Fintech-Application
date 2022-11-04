var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var welcomeEmailTemplate = require("../Emails/FintechEmailTemplate/WelcomeEmailTemplate");
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");
const User = require("../model/User");
const Settings = require("../model/Settings");

class SendWelcomeEmail {
  constructor() {
    this.DbActions = new DbActions();
    this.AuthenticationCode = new AuthenticationCode();
    this.User = new User();
    this.Settings = new Settings();
  }

  async sendMail(userObject, count = 0) {
    try {
      //create the activation code
      let activationCode = await this.AuthenticationCode.createActivationCode(
        userObject,
        "account_activation"
      );

      if (activationCode.status === false) {
        return {
          status: false,
          message: activationCode.message,
          data: [],
        };
      }
      let fullName = userObject.fullname;
      //select the system settings
      let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);
      //title message for the mail
      const emailTitle = "Welcome To " + systemSettings.site_name;

      if (systemSettings === false) {
        throw new Error("System settings could not be retrieved");
      } //show errror if the system settings cant be returned

      //get the template for the mail
      let emailTemplate = welcomeEmailTemplate(
        fullName,
        emailTitle,
        systemSettings,
        activationCode.data
      );

      //get the mail details
      let mailSetup = MailSetups(
        userObject.email,
        emailTitle,
        emailTemplate,
        systemSettings,
        activationCode.data
      );

      let mailSender = await mailler(mailSetup);
      count++;
      if (mailSender.status === false && count < 3) {
        return await this.sendMail(userObject, count);
      }
      return {
        status: true,
        message: "Email was successfully sent",
        data: mailSender,
      };
    } catch (err) {
      return {
        status: false,
        message: err.message,
      };
    }
  }
}

module.exports = SendWelcomeEmail;
