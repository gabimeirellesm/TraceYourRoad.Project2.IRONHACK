const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  if (!req.session.user) {
    res.render("index");
  } else {
    res.render("index", { user: req.session.user });
  }
});

module.exports = router;
