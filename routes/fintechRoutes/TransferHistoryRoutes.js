var express = require("express");
const verifyToken = require("../../helpers/CheckTokenExistense");

let TransactionHistory = require("../../controllers/Api/V1/TransactionHistory");
TransactionHistory = new TransactionHistory();

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//use the middleware above validate,
router.use("/", verifyToken);

router.get("/", async (req, res) => {
  await TransactionHistory.Transfers(req, res);
});

module.exports = router;
