const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const User=require("../schema/UserSchema")
const authMiddleware=require("../../AuthMiddleware")
// Multer konfigürasyonu
cloudinary.config({
  cloud_name: "dq44taq6b",
  api_key: "252643969927681",
  api_secret: "B0vUa4mKYkInJ7CYwiuROuiANkc",
});

// Multer ile Cloudinary'ye resim yükleme ayarı
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });



// PATCH isteğinde dosya yükleme
router.patch("/updateinfo",authMiddleware, upload.single("image"), async (req, res) => {
  const { firstName, lastName, position,salary, city,summary,isOpen } = req.body;
  const id = req.user.id;
  
  // Dosya varsa, dosya bilgilerini alın
  const image = req.file ? req.file.path : null;
  try {
    const updateFields = {};

    if (firstName && firstName.trim() !== "") updateFields.firstName = firstName;
    if (lastName && lastName.trim() !== "") updateFields.lastName = lastName;
    if (position && position.trim() !== "") updateFields.position = position;
    if (city && city.trim() !== "") updateFields.city = city;
    if (summary && summary.trim() !== "") updateFields.summary = summary;
    if (image) updateFields.image = image;
    if (isOpen !== undefined) updateFields.isOpen = isOpen;
    if (salary !== undefined && salary !== null && !isNaN(Number(salary))) {
      updateFields.salary = Number(salary);
    }
   

    // Eğer güncellenecek veri yoksa
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "Yenilənəcək məlumat tapılmadı!" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "İsitfadəçi tapılmadı!" });
    }

    res.status(200).json({
      message: "Məlumatlarınız uğurla yeniləndi!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("İstifaəşi yeniləmə xətası yenidən cəhd edin", error);
    res.status(500).json({
      message: "Bilinməyən bir xəta baş verdi",
      error: error.message,
    });
  }
});

router.patch("/personal-information",authMiddleware, async (req, res) => {
  const { age,militaryStatus,driverLicence,educationLevel, maritalStatus,gender  } = req.body;
  const id = req.user.id;
  try {
    const updateFields = {};

    if (age !== null && age !== undefined && !isNaN(age)) {
      updateFields.age = age;
    }
    if (militaryStatus && militaryStatus.trim() !== "") updateFields.militaryStatus = militaryStatus;
    if (driverLicence && driverLicence.trim() !== "") updateFields.driverLicence = driverLicence;
    if (maritalStatus && maritalStatus.trim() !== "") updateFields.maritalStatus = maritalStatus;
    if (educationLevel && educationLevel.trim() !== "") updateFields.educationLevel = educationLevel;
    if (gender && gender.trim() !== "") updateFields.gender = gender;
   

    // Eğer güncellenecek veri yoksa
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "Yenilənəcək məlumat tapılmadı!" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "İsitfadəçi tapılmadı!" });
    }

    res.status(200).json({
      message: "Məlumatlarınız uğurla yeniləndi!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("İstifaəşi yeniləmə xətası yenidən cəhd edin", error);
    res.status(500).json({
      message: "Bilinməyən bir xəta baş verdi",
      error: error.message,
    });
  }
});

router.post("/add-education", authMiddleware, async (req, res) => {
  const { schoolName, degree, specialty, startYear, endYear } = req.body;
  // Kullanıcıdan gelen eğitim bilgilerini kontrol et
  if (!schoolName || !degree || !specialty || !startYear || !endYear) {
    return res.status(400).json({ message: "Bütün məlumatları daxil edin!" });
  }

  try {
    // Kullanıcıyı token'dan alınan ID ile bul
    const userId = req.user.id;

    // Yeni eğitim bilgisini ekle
    const newEducation = {
      schoolName,
      degree,
      specialty,
      startYear,
      endYear
    };

    // Kullanıcının eğitim alanına yeni bilgiyi ekle
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $push: { education: newEducation } }, // education array'ine yeni bilgi ekle
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!" });
    }

    // Güncellenmiş kullanıcıyı döndür
    res.status(200).json({
      message: "Təhsil məlumatları uğurla əlavə edildi!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Təhsil əlavə edərkən xəta baş verdi", error);
    res.status(500).json({
      message: "Bilinməyən bir xəta baş verdi",
      error: error.message,
    });
  }
});

router.delete("/remove-education/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // Kullanıcı kimliği
    const educationId = req.params.id; // Silinecek eğitim ID'si
    // Kullanıcının education array'inden ilgili eğitimi kaldır
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { education: { _id: educationId } } }, // `_id`'si educationId olan kaydı sil
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!!" });
    }

    res.status(200).json({ message: "Uğurla silindi!", user: updatedUser });
  } catch (error) {
    console.error("Xəta baş verdi", error);
    res.status(500).json({ message: "Xəta baş verdi", error: error.message });
  }
});


router.post("/add-experience", authMiddleware, async (req, res) => {
  const { company, position, startYear, endYear } = req.body;

  // Məlumatların tam olub-olmadığını yoxla
  if (!company || !position || !startYear) {
    return res.status(400).json({ message: "Bütün məlumatları daxil edin!" });
  }

  try {
    // İstifadəçini token-dən gələn ID ilə tap
    const userId = req.user.id;

    // Yeni iş təcrübəsini yarat
    const newExperience = {
      company,
      position,
      startYear,
      endYear,
    };

    // İstifadəçinin **experience** sahəsinə yeni məlumatı əlavə et
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { experience: newExperience } }, // experience array'inə yeni məlumat əlavə et
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!" });
    }

    // Güncellenmiş istifadəçi məlumatlarını qaytar
    res.status(200).json({
      message: "İş təcrübəsi uğurla əlavə edildi!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("İş təcrübəsi əlavə edilərkən xəta baş verdi", error);
    res.status(500).json({
      message: "Bilinməyən bir xəta baş verdi",
      error: error.message,
    });
  }
});


router.delete("/remove-experience/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // Kullanıcı kimliği
    const experienceId = req.params.id; // Silinecek eğitim ID'si
  
    // Kullanıcının education array'inden ilgili eğitimi kaldır
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { experience: { _id: experienceId } } }, // `_id`'si educationId olan kaydı sil
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!!" });
    }

    res.status(200).json({ message: "Uğurla silindi!", user: updatedUser });
  } catch (error) {
    console.error("Xəta baş verdi", error);
    res.status(500).json({ message: "Xəta baş verdi", error: error.message });
  }
});

router.post("/add-language", authMiddleware, async (req, res) => {
  const { name,level } = req.body;

  // Kullanıcıdan gelen eğitim bilgilerini kontrol et
  if (!name || !level) {
    return res.status(400).json({ message: "Bütün məlumatları daxil edin!" });
  }

  try {
    // Kullanıcıyı token'dan alınan ID ile bul
    const userId = req.user.id;

    // Yeni eğitim bilgisini ekle
    const newLanguage = {
      name,
      level,

    };

    // Kullanıcının eğitim alanına yeni bilgiyi ekle
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $push: { languages: newLanguage } }, // education array'ine yeni bilgi ekle
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!" });
    }

    // Güncellenmiş kullanıcıyı döndür
    res.status(200).json({
      message: "Əlavə edildi!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Xəta baş verdi", error);
    res.status(500).json({
      message: "Bilinməyən bir xəta baş verdi",
      error: error.message,
    });
  }
});

router.delete("/remove-language/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // Kullanıcı kimliği
    const languageId = req.params.id; // Silinecek eğitim ID'si
   
    // Kullanıcının education array'inden ilgili eğitimi kaldır
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { languages: { _id: languageId } } }, // `_id`'si educationId olan kaydı sil
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!!" });
    }

    res.status(200).json({ message: "Uğurla silindi!", user: updatedUser });
  } catch (error) {
    console.error("Xəta baş verdi", error);
    res.status(500).json({ message: "Xəta baş verdi", error: error.message });
  }
});

router.post("/add-skill",authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Kimlik doğrulamadan gelen userId
    const { skills } = req.body; // Frontend'den gelen skill listesi

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: "Ən az bir bacarıq daxil edin" });
    }

    // Kullanıcının skill alanını güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { skills: { $each: skills } } }, // Aynı skilleri eklememek için `$addToSet`
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı!" });
    }

    res.json({ message: "Uğurla əlavə edildi", user: updatedUser });
  } catch (error) {
    console.error("Xəta baş verdi", error);
    res.status(500).json({ error: "Şəbəkə xətası" });
  }
});

router.delete("/remove-skill", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Kimlik doğrulamadan gelen userId
    const { skill } = req.body; // Silinecek skill

    if (!skill || typeof skill !== "string") {
      return res.status(400).json({ error: "Xəta" });
    }
   

    // Kullanıcının belirtilen skill'ini kaldır
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { skills: skill } }, // `$pull` ile belirtilen skill kaldırılır
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı!" });
    }

    res.json({ message: "Uğurla silindi", user: updatedUser });
  } catch (error) {
    console.error("Xəta baş verdi:", error);
    res.status(500).json({ error: "Şəbəkə xətası" });
  }
});

router.post("/add-socialmedia", authMiddleware, async (req, res) => {
  const { name, url } = req.body;

  // Kullanıcıdan gelen bilgileri kontrol et
  if (!name || !url) {
    return res.status(400).json({ message: "Bütün məlumatları daxil edin!" });
  }

  try {
    // Kullanıcıyı token'dan alınan ID ile bul
    const userId = req.user.id;

    // Kullanıcı tipi "jobseeker" değilse hata ver


    // Yeni sosyal medya bilgisini ekle
    const newSocialLink = { name, url };

    // Kullanıcının sosyal medya alanına yeni bilgiyi ekle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { socialLinks: newSocialLink } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!" });
    }

    // Güncellenmiş kullanıcıyı döndür
    res.status(200).json({
      message: "Əlavə edildi!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Əlavə edilmədi", error);
    res.status(500).json({
      message: "Bilinməyən bir xəta baş verdi",
      error: error.message,
    });
  }
});


router.delete("/remove-account/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // Token'dan gelen kullanıcı kimliği
    const userType = req.user.type; // Kullanıcı tipi (jobseeker veya employer)
    const socialMediaId = req.params.id; // Silinecek sosyal medya hesabının ID'si

    // Eğer kullanıcı "jobseeker" değilse hata döndür

    // Kullanıcının socialLinks array'inden ilgili sosyal medya hesabını kaldır
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { socialLinks: { _id: socialMediaId } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!" });
    }

    res.status(200).json({ message: "Sosial media hesabı uğurla silindi!", user: updatedUser });
  } catch (error) {
    console.error("Xəta baş verdi", error);
    res.status(500).json({ message: "Xəta baş verdi", error: error.message });
  }
});

module.exports = [router,authMiddleware];
