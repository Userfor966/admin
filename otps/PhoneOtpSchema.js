const mongoose = require("mongoose");

const PhoneOTPSchema = new mongoose.Schema({
  phone: { type: Number, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 dakika sonra otomatik silinir
});

module.exports = mongoose.model("PhoneOTP", PhoneOTPSchema);