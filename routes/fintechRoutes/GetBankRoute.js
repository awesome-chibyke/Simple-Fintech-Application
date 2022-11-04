var express = require("express");
const verifyToken = require("../../helpers/CheckTokenExistense");

const DetailsforView = require("../../helpers/ViewHelper");

const validator = require("../../helpers/validator");
const { errorStatus, successStatus } = require("../../helpers/StatusStrings");

let TransferController = require("../../controllers/Api/V1/TransferController");
TransferController = new TransferController();

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//use the middleware above validate,
router.use("/", verifyToken);

router.get("/", async (req, res) => {
  await TransferController.getBankDetails(req, res);
});

module.exports = router;
