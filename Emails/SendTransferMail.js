var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var TransferMailTemplate = require("../Emails/FintechEmailTemplate/TransferMailTemplate");
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");
const User = require("../model/User");
const Settings = require("../model/Settings");

AuthenticationCode = new AuthenticationCode();

class SendTransferMail {
  constructor() {
    this.DbActions = new DbActions();
    this.User = new User();
    this.Settings = new Settings();
  }

  async sendMail(userObject, BankAccountDetails, count = 0) {
    let fullName = userObject.fullname;

    //select the system settings
    let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);
    //title message for the mail
    const emailTitle = "Debit Transaction Notification";

    if (systemSettings === false) {
      throw new Error("System settings could not be retrieved");
    } //show errror if the system settings cant be returned

    //get the template for the mail
    let emailTemplate = TransferMailTemplate(
      fullName,
      emailTitle,
      systemSettings,
      BankAccountDetails
    );

    //send a welcome email to the user
    let mailSetup = MailSetups(
      userObject.email,
      emailTitle,
      emailTemplate,
      systemSettings
    );
    let mailSender = await mailler(mailSetup);

    count++;
    if (mailSender.status === false && count < 3) {
      return await this.sendMail(userObject, count);
    }

    return mailSender;
  }
}

module.exports = SendTransferMail;
