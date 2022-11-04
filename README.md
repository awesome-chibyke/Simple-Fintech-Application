SIMPLE FINTECH APPLICATION.

A simple application built with nodejs, enables a user to register, login, create deposit and get an account number with which he/she can receive a funds and also user is able to make transfers to other banks.

STEPS TO START UP AND USE APP.

1) Clone repository.
2) Run `npm install` to install dependencies.
3) Rename example.config.env to config.env.
4) Run `npm run knex migrate:latest` to run migrations.
5) Run `nodemon` or `node app` to start application
6) visit link: https://documenter.getpostman.com/view/15717572/2s8YYEMPeh for the end points
7) First Create an account using register endpoint. you will a token sent to our email address. Emails will be delivered to the mailtrap account below

*****login to this mail trap account to get mail, or u can setup up smtp of ur choice as app uses nodemailer****
https://mailtrap.io/
Email Address: realtestzer13@gmail.com
password:jbe7GTf0Ye8W

7) Supply the token sent to your email to activate account, you can resend mail if you didnt get it.
8) Use login endpoint to login, you will be required to authenticate login as a code will be delivered to your email address.
9) Supply code via the Authenticate Code endpoint to continue
10) Visit the `receive money` endpoint to create an account number and receive money from any one.
11) Visit the `make transfer` endpoint to transfer mone to any account number of nigerian bank.
12) You can get bank list via the `GetBank` end point
13) The `view user transaction`, `view user deposit` and `view user transfer` are endpoints respectivel for viewing user`s Transaction history, deposit history and transfer history.
