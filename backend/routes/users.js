const router = require("express").Router(); // Import the Router module from Express
const sql = require("../index.js"); // Import the SQL database module
const uniqid = require("uniqid"); // Import the uniqid module for generating unique IDs

router.route("/").get((req, res) => {
  sql.query("SELECT * FROM users", (err, rows) => {
    // Execute an SQL query to retrieve all rows from the "users" table
    if (err) throw err; // If there's an error, throw it
    res.json(rows); // Send the retrieved rows as a JSON response
  });
});

router.route("/add").post((req, res) => {
  var x = uniqid();
  sql.query(
    "INSERT INTO users (id, phoneNumber, name, created_at, pfp, interactionRunning, notificationId) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      x,
      req.body.phoneNumber,
      req.body.name,
      Date.now(),
      "https://seekpfps.s3.amazonaws.com/Default_pfp-1688597251415.png",
      "",
      null,
    ],
    (err, rows) => {
      if (err) throw err; // If there's an error, throw it
      res.json(x); // Send the inserted ID as a JSON response
    }
  );
});

router.route("/getByID").post((req, res) => {
  sql.query("SELECT * FROM users WHERE id = ?", [req.body.id], (err, rows) => {
    // Execute an SQL query to retrieve rows from the "users" table based on the provided ID
    if (err) throw err; // If there's an error, throw it
    res.json(rows); // Send the retrieved rows as a JSON response
  });
});

router.route("/getByPhone").post((req, res) => {
  sql.query(
    "SELECT * FROM users WHERE phoneNumber = ?",
    [req.body.phoneNumber],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/deleteByID").post((req, res) => {
  sql.query("DELETE FROM users WHERE id = ?", [req.body.id], (err, rows) => {
    // Execute an SQL query to delete rows from the "users" table based on the provided ID
    if (err) throw err; // If there's an error, throw it
    res.json(rows); // Send the deleted rows as a JSON response
  });
});

router.route("/addPfp").post((req, res) => {
  sql.query(
    "UPDATE users SET pfp = ? WHERE id = ?",
    [req.body.pfp, req.body.id],
    (err, rows) => {
      // Execute an SQL query to update rows in the "users" table based on the provided ID
      if (err) throw err; // If there's an error, throw it
      res.json(rows); // Send the updated rows as a JSON response
    }
  );
});

router.route("/updateLocation").post((req, res) => {
  sql.query(
    "UPDATE users SET lat = ?, lon = ? WHERE id = ?",
    [req.body.lat, req.body.lon, req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getLocation").post((req, res) => {
  sql.query(
    "SELECT lat, lon FROM users WHERE id = ?",
    [req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/updateInteractionRunning").post((req, res) => {
  sql.query(
    "UPDATE users SET interactionRunning = ? WHERE id = ?",
    [req.body.interactionRunning, req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/phoneNumberExists").post((req, res) => {
  sql.query(
    "SELECT * FROM users WHERE phoneNumber = ?",
    [req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/updateNotificationId").post((req, res) => {
  sql.query(
    "UPDATE users SET notificationId = ? WHERE id = ?",
    [req.body.notificationId, req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});


module.exports = router; // Export the router module to make it available for other parts of the application
