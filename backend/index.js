/* Be sure to replace the parameters in the following connection string. */
/* Requires mysql2 package('npm install --save mysql2'). Please check https://www.npmjs.com/package/mysql2 for install guide. */

var mysql = require("mysql2");

var connection = mysql.createPool({
  host: "gateway01.us-east-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "",
  password: "",
  database: "seek",
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

// connection.connect(function (err) {
//   if (err) {
//     throw err;
//   }
//   connection.query("SELECT DATABASE();", function (err, rows) {
//     if (err) {
//       throw err;
//     }
//   });
// });

tidb_multi_statement_mode = "ON";

module.exports = connection;
