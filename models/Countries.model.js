const { Schema, model } = require("mongoose");

const countriesSchema = new Schema(
  {
    coutryName: String,
    flagCountry: String,
    date: Number,
    photos: String,
    notes: String,
    favorites: String,
    cities: String,
  },
  {
    timestamps: true,
  }
);

const Countries = model("Countries", countriesSchema);

module.exports = Countries;
