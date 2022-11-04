const express = require("express"); //express application
const dotenv = require("dotenv");
const expressip = require("express-ip");

dotenv.config({ path: "./config/config.env" }); // Load env vars
const http = require("http"); //http for socket.io

//routes area
const login = require("./routes/fintechRoutes/LoginRoute");
const register = require("./routes/fintechRoutes/registerRoute");
const accountActivation = require("./routes/fintechRoutes/AccountActivationRoute");
const ResendLoginAuthCode = require("./routes/fintechRoutes/ResendLoginAuthCode");
const AuthenticateLogin = require("./routes/fintechRoutes/AuthenticateLogin");
const GetBankRoute = require("./routes/fintechRoutes/GetBankRoute");
const TransferRoute = require("./routes/fintechRoutes/TransferRoute");
const GetATransferRoute = require("./routes/fintechRoutes/GetATransferRoute");
const LookUpAccountNumberRoute = require("./routes/fintechRoutes/LookUpAccountNumberRoute");
const ProfileRoute = require("./routes/fintechRoutes/ProfileRoute");
const CreateTransactions = require("./routes/fintechRoutes/CreateTransactions");
const resendActivationEmailRoute = require("./routes/fintechRoutes/resendActivationEmailRoute");
const WebHookUpdateRoute = require("./routes/fintechRoutes/WebHookUpdateRoute");
const WebHookTestRoute = require("./routes/fintechRoutes/WebHookTestRoute");

var device = require("express-device");

var cors = require("cors"); //require cors

const app = express(); //epress application
const port = 3400; //port that app will run

const server = http.createServer(app); //start up socket.io

// server-side
const io = require("socket.io")(server, {
  cors: {
    origins: "*", //http://localhost
    methods: ["GET", "POST"],
  },
});
/*const io = require("socket.io")(server, {
    handlePreflightRequest: (req, res) => {
        console.log(req.headers.origin);
        const headers = {//req.headers.origin
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": 'http://localhost', //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});*/

app.use(cors());
app.use(device.capture());

//set socket
app.set("socketio", io);

app.use(express.static("files"));

app.use(expressip().getIpInfoMiddleware);
app.use((req, res, next) => {
  //Access-Control-Allow-Origin
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/login", login); //login
app.use("/register", register); //register new user
app.use("/resend-activation-email", resendActivationEmailRoute); //resend activation message
app.use("/activate-account", accountActivation);
app.use("/resend-login-code", ResendLoginAuthCode);
app.use("/authenticate-login", AuthenticateLogin);
app.use("/get-banks", GetBankRoute);
app.use("/make-transfer", TransferRoute);
app.use("/fetch-transfer", GetATransferRoute);
app.use("/verity-account-number", LookUpAccountNumberRoute);
app.use("/user-profile", ProfileRoute);
app.use("/create-transaction", CreateTransactions);
app.use("/update-webhook", WebHookUpdateRoute);
app.use("/test-webhook", WebHookTestRoute);

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

/*app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});*/

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
