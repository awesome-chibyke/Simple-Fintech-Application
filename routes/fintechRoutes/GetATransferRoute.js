var express = require("express");
var app = express();
var router = express.Router();

var DbActions = require("../../model/DbActions");
DbActions = new DbActions();

var TransferController = require("../../controllers/Api/V1/TransferController");
TransferController = new TransferController();

const verifyToken = require("../../helpers/CheckTokenExistense");

router.use(
  express.urlencoded({
    extended: true,
  })
);

//resend the login auth code using email
router.get("/single/:transferRef", verifyToken, async (req, res) => {
  await TransferController.getATransfer(req, res);
});

module.exports = router;
