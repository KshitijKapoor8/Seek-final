const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const timeout = require("connect-timeout"); //express v4

// establish express middleware
app.use(cors());
app.use(express.json());
app.use(timeout(100000000));
app.use(haltOnTimedout);

app.use(
  express.urlencoded({
    extended: true,
  })
);

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

// routes
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

const uploadimage = require("./routes/s3routes/uploadimage");
app.use("/uploadimage/", uploadimage);

const friendsRouter = require("./routes/friends");
app.use("/friends", friendsRouter);

const interactionRouter = require("./routes/interaction");
app.use("/interaction", interactionRouter);

const chat_messagesRouter = require("./routes/chat_messages");
app.use("/chat_messages", chat_messagesRouter);

const sendSmsRouter = require("./routes/sendSms");
app.use("/sendSms", sendSmsRouter);

const friendRequestsRouter = require("./routes/friendRequests");
app.use("/friendRequests", friendRequestsRouter);

const uploadPfp = require("./routes/s3routes/uploadpfp");
app.use("/uploadPfp/", uploadPfp);

const geolocRouter = require("./routes/geoloc");
app.use("/geoloc", geolocRouter);

// start connection
app.listen(port, "0.0.0.0", () => {
  console.log(`App listening at http://localhost:${port}`);
});
