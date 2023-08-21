const router = require("express").Router();
const sql = require("../index.js");
const uniqid = require("uniqid");

router.route("/haversineLoc").get((req, res) => {
  sql.query(
    `SELECT 
        id, 
        (
           3959 *
           acos(cos(radians(37)) * 
           cos(radians(lat)) * 
           cos(radians(lon) - 
           radians(-122)) + 
           sin(radians(37)) * 
           sin(radians(lat )))
        ) AS distance 
        FROM users 
        HAVING distance < 200
        ORDER BY distance LIMIT 0, 20;`,
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

module.exports = router;

module.exports = router;
