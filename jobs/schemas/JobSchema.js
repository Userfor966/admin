const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String },
  category: { type: String },
  salary: { type: Number},
  city: { type: String },
  description: { type: String },
  phone:{type:Number},
  email:{type:String},
  gender:{type:String},
  viewCount: { type: Number, default: 0 },

});

const Job = mongoose.model("Jobs", jobSchema);

module.exports = Job;