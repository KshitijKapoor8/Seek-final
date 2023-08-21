const router = require("express").Router();
const sql = require("../index.js");

router.route("/").get((req, res) => {
  sql.query("SELECT * FROM friend_reqs", (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

router.route("/add").post((req, res) => {
  // karnika is an idiot so this is for clarification: user id is the one who is sending the request, friend is the one they are sending to
  sql.query(
    "INSERT INTO friend_reqs (sender_id, recieve_id, created_at) VALUES (?, ?, ?)",
    [req.body.user_id, req.body.friend_id, Date.now()],
    (err, rows) => {
      console.log(err);
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getIncomingFriendReqsByUserID").post((req, res) => {
  const query2 = `
      SELECT *
      FROM friend_reqs
      WHERE recieve_id = ?;
    `;
  sql.query(query2, [req.body.id], (err, rows) => {
    if (err) throw err;
    // console.log(req.body.id);
    res.json(rows);
  });
});

router.route("/getOutgoingFriendReqsByUserID").post((req, res) => {
  const query2 = `
      SELECT *
      FROM friend_reqs
      WHERE sender_id = ?;
    `;

  sql.query(query2, [req.body.id], (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// Route for accepting friend request and adding to friends
router.route("/acceptFriendReq").post((req, res) => {
  const query = `DELETE FROM friend_reqs WHERE sender_id = ? AND recieve_id = ?;`;
  const params = [req.body.sender_id, req.body.recieve_id];

  sql.query(query, params, (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// Route for rejecting friend request
router.route("/rejectFriendReq").post((req, res) => {
  const query = `DELETE FROM friend_reqs WHERE sender_id = ? AND recieve_id = ?;`;
  const params = [req.body.sender_id, req.body.recieve_id];

  sql.query(query, params, (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

module.exports = router;
