const router = require("express").Router();
const sql = require("../index.js");
const uniqid = require("uniqid");

router.route("/sendMsg").post((req, res) => {
  var x = uniqid();
  sql.query(
    `INSERT INTO chat_messages (id, interaction_id, created_at, sender_id, content) VALUES (?, ?, ?, ?, ?)`,
    [
      x,
      req.body.interaction_id,
      Date.now(),
      req.body.sender_id,
      req.body.content,
    ],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getByInteraction").post((req, res) => {
  sql.query(
    `SELECT * FROM chat_messages WHERE interaction_id = ?`,
    [req.body.interaction_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/deleteByInteraction").post((req, res) => {
  sql.query(
    `DELETE FROM chat_messages WHERE interaction_id = ?`,
    [req.body.interaction_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

module.exports = router;
