"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function mailler(mailDetails = {}) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail(mailDetails);

  return {
    status: true,
    message: "Message sent: %s " + info.messageId,
    data: "Preview URL: %s " + nodemailer.getTestMessageUrl(info),
  };
}

mailler().catch((error) => {
  return {
    status: false,
    message: error.message,
    data: [],
  };
});

module.exports = mailler;
