const jwt = require("jsonwebtoken");
let ErrorMessages = require("../helpers/ErrorMessages");
let MessageType = require("../helpers/MessageType");
let User = require("../model/User");
let LoginAuthModel = require("../model/LoginAuthModel");
let PasswordHasher = require("../helpers/PasswordHasher");
User = new User();
LoginAuthModel = new LoginAuthModel();
ErrorMessages = new ErrorMessages();
PasswordHasher = new PasswordHasher();
MessageType = new MessageType();

const verifyToken = async (req) => {
  return new Promise(function (resolve, reject) {
    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
      if (err) {
        reject(err);
      } else {
        resolve(authData);
      }
    });
  });
};

module.exports = verifyToken;
