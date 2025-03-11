const express = require("express");
const router = express.Router();
const User = require("../schema/UserSchema"); // Kullanıcı modelini içe aktar
const jwt = require('jsonwebtoken'); 



// Tüm kullanıcıları getiren endpoint
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Şifreyi döndürmemek için "-password" ekliyoruz
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports = router;
