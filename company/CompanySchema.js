const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  userType:{type:String},
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;