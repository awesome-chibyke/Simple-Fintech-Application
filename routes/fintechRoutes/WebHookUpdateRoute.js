var express = require("express");
var app = express();
var router = express.Router();

var DbActions = require("../../model/DbActions");
DbActions = new DbActions();

const verifyToken = require("../../helpers/CheckTokenExistense");

var WebHooks = require("../../controllers/Api/V1/WebHooks");
WebHooks = new WebHooks();

const DetailsforView = require("../../helpers/ViewHelper"); //for creation crreation of response object

const validator = require("../../helpers/validator"); //for validation of inputs

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate register details
const validationRule = {
  webhook_url: "required|string|min:6",
  webhook_secret_key: "required|string|min:6",
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
router.use("/", verifyToken, validate);

//resend the login auth code using email
router.post("/", async (req, res) => {
  await WebHooks.updatewebHook(req, res);
});

module.exports = router;
