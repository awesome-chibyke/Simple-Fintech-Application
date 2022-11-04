var express = require("express");
var app = express();
var router = express.Router();

var DbActions = require("../../model/DbActions");
DbActions = new DbActions();

var RegisterController = require("../../controllers/Api/V1/RegisterController");
RegisterController = new RegisterController();

var LoginController = require("../../controllers/Api/V1/LoginController");
LoginController = new LoginController();

const DetailsforView = require("../../helpers/ViewHelper"); //for creation crreation of response object

const validator = require("../../helpers/validator"); //for validation of inputs

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate register details
const validationRule = {
  email: "required|email",
}; //confirmed

//validate the user details
const validate = (req, res, next) => {
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      const responseValue = DetailsforView(false, err.errors, {});
      res.status(400).json(responseValue);
    } else {
      next();
    }
  });
};

//use the middleware above validate,
router.use("/", validate);

//resend the activation email to the user for account activation
router.post("/", async (req, res) => {
  await RegisterController.resendActivationEmail(req, res);
});

module.exports = router;
