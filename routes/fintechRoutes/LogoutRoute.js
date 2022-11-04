var express = require("express");
const verifyToken = require("../../helpers/CheckTokenExistense");

let LogoutController = require("../../controllers/LogoutController");
LogoutController = new LogoutController();

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validation ends
router.get("/", verifyToken, async (req, res) => {
  await LogoutController.logout(req, res);
});

module.exports = router;
