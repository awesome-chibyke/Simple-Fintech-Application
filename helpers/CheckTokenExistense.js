const DetailsforView = require("./ViewHelper");
const { errorStatus, successStatus } = require("./StatusStrings");

const CheckTokenExistense = (req, res, next) => {
  //function that returns the token in the request
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    //console.log(bearerHeader);
    const bearerToken = bearerHeader.split(" ")[1];

    req.token = bearerToken;

    next();
  } else {
    const responseObject = DetailsforView(
      errorStatus,
      "Token was not supplied, please login",
      {},
      "log-user-out"
    );
    res.status(400).json(responseObject);
  }
};

module.exports = CheckTokenExistense;
