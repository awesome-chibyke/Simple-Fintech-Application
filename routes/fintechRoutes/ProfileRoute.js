var express = require("express");
var app = express();
var router = express.Router();

var DbActions = require("../../model/DbActions");
DbActions = new DbActions();

var ProfileController = require("../../controllers/Api/V1/ProfileController");
ProfileController = new ProfileController();

const verifyToken = require("../../helpers/CheckTokenExistense");

router.use(
  express.urlencoded({
    extended: true,
  })
);

//resend the login auth code using email
router.get("/", verifyToken, async (req, res) => {
  await ProfileController.Profile(req, res);
});

module.exports = router;
