var express = require("express"); //require express
var router = express.Router();

var DbActions = require("../../model/DbActions");
DbActions = new DbActions();

var AccountActivation = require("../../controllers/Api/V1/AccountActivation"); //require register controller
AccountActivation = new AccountActivation();

const DetailsforView = require("../../helpers/ViewHelper");

const validator = require("../../helpers/validator");

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate register details
const validationRule = {
  email: "required|email",
  token: "required|numeric",
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

//create the route that recives the incoming request
router.post("/", async (req, res) => {
  await AccountActivation.ActivateAccount(req, res);
});

module.exports = router;
