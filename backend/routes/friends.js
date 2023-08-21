const router = require("express").Router();
const sql = require("../index.js");

router.route("/add").post((req, res) => {
  sql.query(
    "INSERT INTO friends (user_id, friend_id) VALUES (?, ?)",
    [req.body.id1, req.body.id2],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getUserFriends").post((req, res) => {
  const query2 = `
      SELECT *
      FROM friends
      WHERE user_id = ? OR friend_id = ?;
    `;

  sql.query(query2, [req.body.id, req.body.id], (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

router.route("/").get((req, res) => {
  sql.query("SELECT * FROM friends", (err, rows) => {
    // Execute an SQL query to retrieve all rows from the "users" table
    if (err) throw err; // If there's an error, throw it
    res.json(rows); // Send the retrieved rows as a JSON response
  });
});

module.exports = router;
