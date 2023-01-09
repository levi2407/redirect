const express = require("express");
const md5 = require("md5");
const router = express.Router();
require("dotenv").config();
const dbo = require("../db/conn");


// login
router.route("/redirect").get(async function(req, res) {
    const dbConnect = dbo.getDb();
    dbConnect
        .collection("redirects")
        .find().toArray((err, objs) => {
            if (err) throw err;

            if (objs.length != 0) console.log("Lấy dữ liệu thành công ..... ");
            console.log(objs);

            if (req.query.id === objs[0].idmd5) {
                res.redirect(301, objs[0].endpoint);
                // update clicktimes
                const listingQuery = { idmd5: objs[0].idmd5 };
                if (!req.body.userID) {
                    dbConnect
                        .collection("redirects")
                        .updateOne(listingQuery, { $set: { clickTimes: (Number(objs[0].clickTimes) + 1) } }, function(err, _result) {

                        });
                } else {
                    res.json({ status: "fail", message: "error" });
                }


            } else {
                res.json({ status: 404 })
            }

        });



});

router.route("/create-redirect").post(async function(req, res) {
    console.log(req.body);
    const dbConnect = dbo.getDb();
    //validate data
    // MD5 (name + useriD + url)

    if (req.body) {
        console.log(req.body.userID + " :create-redirect");
        dbConnect
            .collection("redirects")
            .find({ idmd5: req.body.idmd5 })
            .limit(1)
            .toArray(function(err, result) {
                if (err) {
                    res.json({ status: "fail", message: err });
                } else {
                    if (result.length > 0) {
                        res.json({ status: "fail", message: "username is available!" });
                    } else {
                        dbConnect
                            .collection("redirects")
                            .insertOne(req.body, function(err, result) {
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


// update redirect
router.route("/update-redirect").post(async function(req, res) {
    const dbConnect = dbo.getDb();
    const listingQuery = { idmd5: req.body.idmd5 };

    dbConnect
        .collection("redirects")
        .updateOne(listingQuery, { $set: req.body }, function(err, _result) {
            if (err) {
                res.json({ status: "fail", message: err });
            } else {
                res.json({ status: "success", message: _result });
            }
        });

});


// get-data
router.route("/get-data").post(async function(req, res) {
    const dbConnect = dbo.getDb();
    dbConnect
        .collection("redirects")
        .find({ userID: req.body.userID }).toArray((err, objs) => {
            if (err) throw err;

            if (objs.length != 0) console.log("Lấy dữ liệu thành công ..... ");
            console.log(objs);

        });
});



// delete redirect
router.route("/delete-redirect").post(async function(req, res) {
    const dbConnect = dbo.getDb();
    const listingQuery = { idmd5: req.body.idmd5 };
    if (!req.body.idmd5) {
        dbConnect
            .collection("redirects")
            .deleteOne(listingQuery, { $set: req.body }, function(err, _result) {
                if (err) {
                    res.json({ status: "fail", message: err });
                } else {
                    res.json({ status: "success", message: _result });
                }
            });
    } else {
        res.json({ status: "fail", message: "error" });
    }
});


module.exports = router;