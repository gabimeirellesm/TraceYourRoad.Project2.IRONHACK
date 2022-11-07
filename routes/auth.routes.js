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

router.post('/signup', async (req, res, next) => {
  const { firstName, lastName, countryOfBirth, residence, email, password } = req.body;

  try {
    if (!firstName || !lastName ||!countryOfBirth || !residence || !email || !password) {
      res.render('auth/signup', {
        errorMessage: 'All the fields are mandatory. Please input a username, email and passowrd',
      });
      return;
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      res.status(500).render('auth/signup', {
        errorMessage:
          'Invalid password, password needs to have at least 6 characters and include an uppercase and lowercase character',
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({ firstName, lastName, countryOfBirth, residence, email, password: hashedPassword });

    res.redirect('/');
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render('auth/signup', { errorMessage: error.message });
    } else if (error.code === 11000) {
      res.status(500).render('auth/signup', { errorMessage: ' Username or email already exists' });
    }

    next(error);
  }
});


/* _____________________________________ LOGIN _____________________________________________ */

/* router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, email, password } = req.body;
  if (username === "" || email === "" || password === "") {
    res.status(400).render("auth/login", {
      errorMessage:
        "All fields are mandatory. Please provide username, email and password.",
    });

    return;
  }
  if (password.length < 6) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 6 characters long.",
    });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res
          .status(400)
          .render("auth/login", { errorMessage: "Wrong credentials." });
        return;
      }

      bcrypt
        .compare(password, user.password)
        .then((isSamePassword) => {
          if (!isSamePassword) {
            res
              .status(400)
              .render("auth/login", { errorMessage: "Wrong credentials." });
            return;
          }

          req.session.currentUser = user.toObject();

          delete req.session.currentUser.password;

          res.redirect("/");
        })
        .catch((err) => next(err)); 
    })
    .catch((err) => next(err));
}); */

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



