const router = require("express").Router();
const sql = require("../index.js");
const uniqid = require("uniqid");
const axios = require("axios");

// for done, -1 is cancelled, 0 is initial, 1 is accepted and in process, 2 is done fully
router.route("/add").post((req, res) => {
  var x = uniqid();
  var y = Date.now();
  sql.query(
    `INSERT INTO interaction (id, link, user_one, user_two, created_at, done, likes, location, link2, userOneAccepted, userTwoAccepted) VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      x,
      null,
      req.body.user_one,
      req.body.user_two,
      y,
      false,
      0,
      "Could not find Location",
      null,
      0,
      0,
    ],
    (err, rows) => {
      if (err) throw err;
      res.json({
        id: x,
        user_one: req.body.user_one,
        user_two: req.body.user_two,
        created_at: y,
      });
    }
  );
});

router.route("/closeInteraction").post((req, res) => {
  sql.query(
    `UPDATE interaction
          SET
            link = CASE
              WHEN user_one = ? THEN ?
              ELSE link
            END,
            link2 = CASE
              WHEN user_two = ? THEN ?
              ELSE link2
            END,
            done = CASE
              WHEN link IS NOT NULL AND link2 IS NOT NULL THEN 2
              ELSE done
            END
          WHERE id = ?;`,
    [
      req.body.userId,
      req.body.link,
      req.body.userId,
      req.body.link,
      req.body.id,
    ],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/close").post((req, res) => {
  sql.query(
    `UPDATE interaction
          SET done = CASE
          WHEN link IS NOT NULL AND LINK2 IS NOT NULL THEN 2
          ELSE done
          END
          WHERE id = ?`,
    [req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/changeAcceptance").post((req, res) => {
  sql.query(
    `
  UPDATE interaction
  SET
    userOneAccepted = CASE
      WHEN user_one = ? THEN ?
      ELSE userOneAccepted
    END,
    userTwoAccepted = CASE
      WHEN user_two = ? THEN ?
      ELSE userTwoAccepted
    END,
    done = CASE
      WHEN userOneAccepted = 1 AND userTwoAccepted = 1 THEN 1
      WHEN userOneAccepted = -1 OR userTwoAccepted = -1 THEN -1
      ELSE done
    END
  WHERE id = ?`,
    [
      req.body.userId,
      req.body.acceptance,
      req.body.userId,
      req.body.acceptance,
      req.body.id,
    ],
    (err, rows) => {
      if (err) throw err;

      res.json(rows);
    }
  );
});

router.route("/getByID").post((req, res) => {
  sql.query(
    "SELECT * FROM interaction WHERE id = ?",
    [req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getByIdDone").post((req, res) => {
  sql.query(
    "SELECT * FROM interaction WHERE (user_one = ? OR user_two = ?) AND done = true",
    [req.body.id, req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getByUser").post((req, res) => {
  sql.query(
    "SELECT * FROM interaction WHERE user_one = ? OR user_two = ?",
    [req.body.user_id, req.body.user_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getByUserDone").post((req, res) => {
  sql.query(
    "SELECT * FROM interaction WHERE (user_one = ? OR user_two = ?) AND done = 2",
    [req.body.user_id, req.body.user_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/deleteByID").post((req, res) => {
  sql.query(
    "DELETE FROM interaction WHERE id = ?",
    [req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/").get((req, res) => {
  sql.query("SELECT * FROM interaction", (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

router.route("/getOtherUserAccepted").post((req, res) => {
  sql.query(
    `
  SELECT 
    CASE
        WHEN user_one = ? THEN userTwoAccepted
        WHEN user_two = ? THEN userOneAccepted
        ELSE NULL
    END AS Accepted
  FROM
    interaction
  WHERE
    id = ?;

  
  `,
    [req.body.userId, req.body.userId, req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.route("/getDone").post((req, res) => {
  sql.query(
    "SELECT done FROM interaction WHERE id = ?",
    [req.body.id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

module.exports = router;
