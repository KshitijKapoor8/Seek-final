const router = require("express").Router();
const telesignSDK = require("telesignsdk");

const customerId = "";
const apiKey =
  "";
const rest_endpoint = "https://rest-api.telesign.com";
const timeout = 10 * 1000; // 10 secs

const client = new telesignSDK(customerId, apiKey, rest_endpoint);

router.route("/send").post((req, res) => {
  const number = req.body.number;
  const message = req.body.message;
  const messageType = "ARN";

  console.log("## MessagingClient.message ##");

  function messageCallback(error, responseBody) {
    if (error) {
      console.error(error);
    } else {
      res.json("Message sent successfully");
      console.log(responseBody);
    }
  }

  client.sms.message(messageCallback, number, message, messageType);
});

router.route("/verify").post((req, res) => {
  const number = req.body.number;
  // const code = Math.floor(Math.random() * 99999).toString();
  const code = "11111";
  const message = "Your verification code is " + code;

  const messageType = "ARN";

  console.log("## MessagingClient.message ##", Date.now());

  function messageCallback(error, responseBody) {
    if (error) {
      console.error(error);
    } else {
      res.json(code);
      console.log(responseBody);
    }
  }

  client.sms.message(messageCallback, number, message, messageType);
});

module.exports = router;
