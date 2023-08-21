const router = require("express").Router();
const sql = require("../index.js");
const uniqid = require("uniqid");

router.post("/add", (req, res) => {
  var x = uniqid();
  sql.query(
    `INSERT INTO likes (id, user_id, interaction_id) VALUES (?, ?, ?)`,
    [x, req.body.user_id, req.body.interaction_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.post("/removeLikes", (req, res) => {
  sql.query(
    `DELETE FROM likes WHERE interaction_id = ? AND user_id = ?`,
    [req.body.interaction_id, req.body.user_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.post("/getAllUserLikes", (req, res) => {
  sql.query(
    `SELECT * FROM likes WHERE user_id = ?`,
    [req.body.user_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.post("/getAllInteractionLikes", (req, res) => {
  sql.query(
    `SELECT * FROM likes WHERE interaction_id = ?`,
    [req.body.interaction_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});
