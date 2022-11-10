const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    photo: String,
    countryOfBirth: String,
    residence: String,
    createdCountries: [{ type: Schema.Types.ObjectId, ref: "Countries" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
