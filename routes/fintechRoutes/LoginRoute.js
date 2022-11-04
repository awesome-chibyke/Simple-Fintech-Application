var express = require("express");
const verifyToken = require("../../helpers/CheckTokenExistense");

const DetailsforView = require("../../helpers/ViewHelper");

const validator = require("../../helpers/validator");

let LoginController = require("../../controllers/Api/V1/LoginController");
LoginController = new LoginController();

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate register details
const validationRule = {
  email: "required|email",
  password: "required|string",
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

router.post("/", async (req, res) => {
  await LoginController.loginAction(req, res);
});

module.exports = router;
