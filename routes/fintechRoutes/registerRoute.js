var express = require("express"); //require express
var router = express.Router();

var DbActions = require("../../model/DbActions");
DbActions = new DbActions();

var RegisterController = require("../../controllers/Api/V1/RegisterController"); //require register controller
RegisterController = new RegisterController();

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
  password: "required|string|min:6|same:confirm_password",
  fullname: "required|string|min:3",
  phone: "required|numeric|min:11",
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
  await RegisterController.register(req, res);
});

module.exports = router;
