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



router.get("/users-search", async (req, res) => {
  try {
    const {
      gender,
      educationLevel,
      militaryStatus,
      minsalary,
      maxsalary,
      city,
      minAge,
      maxAge,
    } = req.query;
    console.log(req.query)

    let query = {};

    // Cinsiyet filtresi
    if (gender && gender !== "Fərqi yoxdur") {
      query.gender = gender;
    }

    // Eğitim seviyesi filtresi
    if (educationLevel && educationLevel !== "Fərqi yoxdur") {
      query.educationLevel = educationLevel;
    }

    // Askerlik durumu filtresi
    if (militaryStatus && militaryStatus !== "Vacib deyil") {
      query.militaryStatus = militaryStatus;
    }

    // Maaş aralığı filtresi
    if (minsalary && maxsalary) {
      query.salary = {
        $gte: minsalary, // Min maaş
        $lte: maxsalary, // Max maaş
      };
    } else if (minsalary) {
      query.salary = { $gte: minsalary }; // Min maaş
    } else if (maxsalary) {
      query.salary = { $lte: maxsalary }; // Max maaş
    }

    if (minAge && maxAge) {
      // Min ve max yaş filtrelemesi
      query.age = { $gte: minAge, $lte: maxAge }; // Yaş aralığı
    } else if (minAge) {
      // Min yaş filtresi
      query.age = { $gte: minAge }; // Yaş en az min yaş kadar
    } else if (maxAge) {
      // Max yaş filtresi
      query.age = { $lte: maxAge }; // Yaş en fazla max yaş kadar
    }

    // Şehir filtresi
    if (city) {
      query.city = city;
    }

    // Yaş aralığı filtresi
   

    // Kullanıcıları sorgulama
    const users = await User.find(query);

    res.json(users);
  } catch (error) {
    console.error("Axtarış zamanı xəta:", error);
    res.status(500).json({ error: "Axtarış zamanı xəta" });
  }
});





module.exports = router;
