const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const saltRounds = 10;
const User = require("../models/User.model");

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", isLoggedOut, (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  const { firstName, lastName, countryOfBirth, residence, email, password } =
    req.body;

  try {
    if (
      !firstName ||
      !lastName ||
      !countryOfBirth ||
      !residence ||
      !email ||
      !password
    ) {
      res.render("auth/signup", {
        errorMessage:
          "All the fields are mandatory. Please input a username, email and passowrd",
      });
      return;
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      res.status(500).render("auth/signup", {
        errorMessage:
          "Invalid password, password needs to have at least 6 characters and include an uppercase and lowercase character",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      firstName,
      lastName,
      countryOfBirth,
      residence,
      email,
      password: hashedPassword,
    });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render("auth/signup", { errorMessage: error.message });
    } else if (error.code === 11000) {
      res.status(500).render("auth/signup", {
        errorMessage: " Username or email already exists",
      });
    }

    next(error);
  }
});

/* _____________________________________ LOGIN _____________________________________________ */

router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

//passwrod Lua: 12345Aa.
router.post("/login", isLoggedOut, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!password || !email) {
      res.render("auth/login", {
        errorMessage:
          "All the fields are mandatory. Please input an email and passoword",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.render("auth/login", {
        errorMessage: "Email not found",
      });
      return;
    } else if (bcrypt.compareSync(password, user.password)) {
      //This will compare the plain text password from the input with the hashed password we stored in the database

      req.session.user = user;
      res.redirect("/profile");
    } else {
      //If the user exists BUT the password is wrong
      res.render("auth/login", {
        errorMessage: "Wrong password.",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/profile", isLoggedIn, (req, res) => {
  const user = req.session.user;
  console.log(user);

  res.render("auth/profile", user);
});

/* _____________________________________ LOG OUT _____________________________________________ */

/* router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).render("auth/logout", { errorMessage: err.message });
      return;
    }

    res.redirect("/");
  });
});
 */
module.exports = router;
