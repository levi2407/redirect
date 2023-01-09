const express = require("express");
const userProfile = express.Router();
// This will help us connect to the database
const dbo = require("../db/conn");

//get list video liked
userProfile.route("/liked-videos").get(async function (req, res) {
  res.json({ status: true });
});

module.exports = userProfile;
