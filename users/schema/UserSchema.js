const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  phone:{type:Number},
  city:{type:String},
  banner: { type: String },
  position: { type: String }, 
  salary:{type:Number,default:null},
  summary: { type: String },
  education: [
    {
      schoolName: { type: String },
      degree: { type: String },
      specialty: { type: String }, 
      startYear: { type: String },
      endYear: { type: String }
    }
  ],
  experience: [
    {
      company: { type: String },
      position: { type: String },
      startYear: { type: String },
      endYear: { type: String },
    }
  ],
  languages: [
    {
      name: { type: String },
      level: { type: String },
    }
  ],
  skills: [{ type: String }] ,
  isOpen:{type:Boolean},
  age:{type:Number},
  militaryStatus:{type:String},
  driverLicence:{type:String},
  maritalStatus:{type:String},
  gender:{type:String},
  educationLevel:{type:String},
  socialLinks:[{
    name:{type:String},
    url:{type:String},
  }],
  userType:{type:String},
});

const User = mongoose.model("User", userSchema);

module.exports = User;