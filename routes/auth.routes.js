const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const saltRounds = 10;
const User = require("../models/User.model");
const axios = require("axios");
const Countries = require("../models/Countries.model");

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
      res.render("auth/login")
    } else if (bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.redirect("/auth/profile");
    } else {
      res.redirect('/auth/login')
      /* res.render("auth/login", {
        errorMessage: "Wrong password.",
      }); */
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});



/* _____________________________________ LOG OUT _____________________________________________ */

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).render("auth/logout", { errorMessage: err.message });
      return;
    }

    res.redirect("login");
  });
});

module.exports = router;


/* _____________________________________ PROFILE _____________________________________________ */



router.get("/profile", (req, res) => {
  const user = req.session.user;


  axios.get("https://restcountries.com/v3.1/all")
    .then(response => {
      res.render("auth/profile", {user, countries: response.data});
    })

});

router.post("/create-card", (req, res, next) => {
   axios.get(`https://restcountries.com/v3.1/name/${req.body.countries}`)
    .then(response => {
      console.log(response.data);
      Countries.create({countryName: response.data[0].name.common, flagCountry: response.data[0].flags.png})  
      res.redirect("/auth/profile");
    })
})


/* _____________________________________ API _____________________________________________ */
 
router.get("/", (req, res, next) => {

  axios.get("https://restcountries.com/v3.1/all")
    .then(response => {
      console.log(response.name.official);
      res.render("profile", { result: response.name.official});
    })

});

/* _____________________________________ COUNTRIES _____________________________________________ */

router.get("/countries", async (req, res, next) => {
  try {
      const getCountries = await Countries.find();
      res.render("celebrities/celebrities", {getCountries})
  } catch(error){
      console.log(error);
      next(error);
  }
}) 