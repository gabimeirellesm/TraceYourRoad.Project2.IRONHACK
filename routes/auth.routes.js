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

/* _____________________________________ SIGN UP _____________________________________________ */

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

    const user = await User.create({
      firstName,
      lastName,
      countryOfBirth,
      residence,
      email,
      password: hashedPassword,
    });

    req.session.user = user;

    res.redirect("/auth/profile");
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
      res.render("auth/login");
    } else if (bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.redirect("/auth/profile");
    } else {
      res.redirect("/auth/login"),
        {
          errorMessage: "Wrong password.",
        };
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

router.get("/profile", async (req, res) => {
  const userId = req.session.user._id;

  const response = await axios.get("https://restcountries.com/v3.1/all");
  const user = await User.findById(userId).populate("createdCountries");

  const numbCountries = user.createdCountries.length;

  res.render("auth/profile", { user, countries: response.data, numbCountries });
});

//CREATE CARD IN PROFILE
router.post("/create-card", async (req, res, next) => {
  const thisUser = await User.findById(req.session.user._id).populate(
    "createdCountries"
  );

  const apiCall = await axios.get(
    `https://restcountries.com/v3.1/name/${req.body.countries}`
  );

  /*   thisUser.createdCountries.forEach((country) => {
    if (country.countryName === apiCall.data[0].name.common) {
      return res.redirect(`/auth/card-details/${country._id}`);
    }
  }); */
  let countryNames = [];
  thisUser.createdCountries.forEach((country) => {
    countryNames.push(country.countryName);
  });

  if (countryNames.includes(apiCall.data[0].name.common)) {
    const foundCountry = await Countries.findOne({
      countryName: apiCall.data[0].name.common,
    });
    return res.redirect(`/auth/card-details/${foundCountry._id}`);
  } else {
    const createdCountry = await Countries.create({
      countryName: apiCall.data[0].name.common,
      flagCountry: apiCall.data[0].flags.png,
      capital: apiCall.data[0].capital[0],
      currency: Object.keys(apiCall.data[0].currencies)[0],
      language: Object.values(apiCall.data[0].languages),
    });

    const userUpdate = await User.findByIdAndUpdate(req.session.user._id, {
      $push: { createdCountries: createdCountry._id },
    });

    res.redirect(`/auth/card-details/${createdCountry._id}`);
  }
});

/* _____________________________________ API _____________________________________________ */

router.get("/", (req, res, next) => {
  axios.get("https://restcountries.com/v3.1/all").then((response) => {
    console.log(response.name.official);
    res.render("profile", { result: response.name.official });
  });
});

/* _____________________________________ EDIT PROFILE _____________________________________________ */

router.get("/edit-profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("auth/edit-profile", user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/edit-profile", async (req, res, next) => {
  const { firstName, lastName, countryOfBirth, residence /* currentImage */ } =
    req.body;
  try {
    /*     let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl = currentImage;
    } */
    const userId = req.session.user._id;
    await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      countryOfBirth,
      residence,
      /* photo */
    });
    res.redirect("/auth/edit-profile");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndRemove(id);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/* _____________________________________ EDIT CARD _____________________________________________ */

router.get("/edit-card/:id", async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const thisCard = await Countries.findById(cardId);

    let departDate = thisCard.departureDate;
    departDate.value = thisCard.departureDate.toISOString().substr(0, 10);

    let arrivDate = thisCard.arrivalDate;
    arrivDate.value = thisCard.arrivalDate.toISOString().substr(0, 10);

    res.render("auth/edit-card", { thisCard, cardId, departDate, arrivDate });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/edit-card/:id", async (req, res, next) => {
  try {
    const {
      arrivalDate,
      departureDate,
      notes,
      favorites,
      cities /* photos */,
    } = req.body;
    const cardId = req.params.id;

    /*     let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl = currentImage;
    } */

    await Countries.findByIdAndUpdate(cardId, {
      arrivalDate,
      departureDate,
      notes,
      favorites,
      cities,
      /* photo */
    });
    res.redirect(`/auth/card-details/${cardId}`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/del/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.session.user._id;
    await Countries.findByIdAndRemove(id);
    res.redirect(`/auth/profile`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/* _____________________________________ CARD DETAILS _____________________________________________ */

router.get("/card-details/:id", async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const card = await Countries.findById(cardId);

    const departDate = card.departureDate.toLocaleDateString("en-uk", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const arrivDate = card.arrivalDate.toLocaleDateString("en-uk", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    res.render("auth/card-details", { card, departDate, arrivDate });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
