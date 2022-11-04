var express = require("express");
//let responseObject = require("../controllers/ViewController");
let TestController = require("../../controllers/TestController");

// Instantiate Functions
//responseObject = new responseObject();
TestController = new TestController();
// Call Express
var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.get("/", async (req, res) => {
  await TestController.try(req, res);
  //return res.json("it worked");
});

module.exports = router;
//selectAllPrivileges
