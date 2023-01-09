const express = require("express");
const authorRouter = express.Router();
const jwt = require("jsonwebtoken");
let refreshTokens = [];
require("dotenv").config();


//jwt authenticate => userID
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// This will help us connect to the database
const dbo = require("../db/conn");
// login
authorRouter.route("/login").get(async function (req, res) {
  const dbConnect = dbo.getDb();
  if (req.body.username && req.body.password) {
    dbConnect
      .collection("user_profile")
      .find(req.body)
      .limit(1)
      .toArray(function (err, result) {
        if (err) {
          res.json({ status: "fail", message: err });
        } else {
          if (result.length > 0) {
            const user = { userID: result[0].userID };
            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(
              user,
              process.env.REFRESH_TOKEN_SECRET
            );
            refreshTokens.push(refreshToken);
            res.json({
              status: "success",
              data: result,
              accessToken: accessToken,
              refreshToken: refreshToken,
            });
          } else {
            res.json({ status: "fail", message: "norecord" });
          }
        }
      });
  } else {
    res.json({
      status: "fail",
      message: "username and password can not be null!",
    });
  }
});
// register
authorRouter.route("/register").post(function (req, res) {
  const dbConnect = dbo.getDb();

  if (req.body) {
    console.log(req.body.username + " :register");
    dbConnect
      .collection("user_profile")
      .find({ username: req.body.username })
      .limit(1)
      .toArray(function (err, result) {
        if (err) {
          res.json({ status: "fail", message: err });
        } else {
          if (result.length > 0) {
            res.json({ status: "fail", message: "username is available!" });
          } else {
            dbConnect
              .collection("user_profile")
              .insertOne(req.body, function (err, result) {
                if (err) {
                  res.json({ status: "fail", message: err });
                } else {
                  res.json({ status: "success", message: result });
                }
              });
          }
        }
      });
  }
});

// update user info
authorRouter
  .route("/update-user-info")
  .post(authenticateToken, function (req, res) {
    const dbConnect = dbo.getDb();
    const listingQuery = { userID: req.user.userID };
    if (!req.body.username) {
      dbConnect
        .collection("user_profile")
        .updateOne(listingQuery, { $set: req.body }, function (err, _result) {
          if (err) {
            res.json({ status: "fail", message: err });
          } else {
            res.json({ status: "success", message: _result });
          }
        });
    } else {
      res.json({ status: "fail", message: "can't change username" });
    }
  });


// This section will help you delete a record.
// authorRouter.route("/listings/delete/:id").delete((req, res) => {
//   const dbConnect = dbo.getDb();
//   const listingQuery = { listing_id: req.body.id };

//   dbConnect
//     .collection("listingsAndReviews")
//     .deleteOne(listingQuery, function (err, _result) {
//       if (err) {
//         res
//           .status(400)
//           .send(`Error deleting listing with id ${listingQuery.listing_id}!`);
//       } else {
//         console.log("1 document deleted");
//       }
//     });
// });

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10000s",
  });
}

module.exports = authorRouter;
