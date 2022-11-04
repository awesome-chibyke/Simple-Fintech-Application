var express = require("express");
var app = express();
var router = express.Router();

const verifyToken = require("../../helpers/CheckTokenExistense");

var TransferController = require("../../controllers/Api/V1/TransferController");
TransferController = new TransferController();

const DetailsforView = require("../../helpers/ViewHelper"); //for creation crreation of response object

const validator = require("../../helpers/validator"); //for validation of inputs

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate register details
const validationRule = {
  bank_code: "required|string|min:3",
  account_number: "required|string|min:10",
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
  await TransferController.lookUpAnAccountNumber(req, res);
});

module.exports = router;
