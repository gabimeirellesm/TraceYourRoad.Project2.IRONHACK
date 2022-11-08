const { Schema, model } = require("mongoose");

const countriesSchema = new Schema(
  {
    countryName: String,
    flagCountry: String,
    date: Number,
    photos: String,
    notes: String,
    favorites: String,
    cities: String,
    capital: String,
    currency: String,
    language: String,
  },
  {
    timestamps: true,
  }
);

const Countries = model("Countries", countriesSchema);

module.exports = Countries;
