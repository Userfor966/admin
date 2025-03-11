const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true }, 
  summary: { type: String },
  socialMedia: [
    {
      platform: { type: String, required: true },
      url: { type: String, required: true }
    }
  ],
  education: [
    {
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      field: { type: String }, 
      startYear: { type: Number },
      endYear: { type: Number }
    }
  ],
  skills: [{ type: String }] ,
  image:{type:String},
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;