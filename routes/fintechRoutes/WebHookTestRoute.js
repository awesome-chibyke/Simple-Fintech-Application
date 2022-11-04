var express = require("express");
var app = express();
var router = express.Router();

var DbActions = require("../../model/DbActions");
DbActions = new DbActions();

var WebHooks = require("../../controllers/Api/V1/WebHooks");
WebHooks = new WebHooks();

const DetailsforView = require("../../helpers/ViewHelper"); //for creation crreation of response object

const validator = require("../../helpers/validator"); //for validation of inputs

router.use(
  express.urlencoded({
    extended: true,
  })
);
router.use(express.json());

//resend the login auth code using email
router.post("/", async (req, res) => {
  await WebHooks.ProcessTransferHook(req, res);
});

module.exports = router;
