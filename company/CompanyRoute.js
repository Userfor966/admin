const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Company = require("./CompanySchema");
const User=require("../users/schema/UserSchema")
const OTP=require("../otps/OtpSchema")
const jwt = require('jsonwebtoken'); 
const router = express.Router();
const nodemailer = require('nodemailer');
SECRET_KEY="3a55b94f7bedae66c30b544b4c044ea8d7790ef693b138012011441763c2c83fca2eebd0a253db4a5c63e5d00f1c05f040512df5f3ad124bf2e1b3af9fd220c5"

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // Gmail SMTP sunucusu
  port: 587,  // TLS için 587 portunu kullanıyoruz
  secure: false,  // TLS için false
  auth: {
    user: 'ismayilhebibov01@gmail.com',  // Gmail adresiniz
    pass: 'ccjt znpu rdkh cfip',   // Gmail şifreniz veya uygulama şifreniz
  },
  tls: {
    rejectUnauthorized: false,  // Sertifika doğrulamasını geçmek
  },
});
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6 haneli OTP
}


// Cloudinary yapılandırması
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


router.post("/send-company-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Email'in daha önce kullanılıp kullanılmadığını kontrol et
    const existingCompany = await Company.findOne({ email });
    const existingJobSeeker = await User.findOne({ email });

    if (existingCompany || existingJobSeeker) {
      return res.status(400).json({ message: "Bu email başqa hesabda istifadə olunur" });
    }

    // Daha önce gönderilmiş OTP var mı?
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP) {
      return res.status(400).json({ message: "Təsdiqləmə kodu göndərilb,Bir qədər gözləyin" });
    }

    // OTP oluştur
    const otp = generateOTP();

    // OTP'yi veritabanına kaydet
    const otpRecord = new OTP({ email, otp });
    await otpRecord.save();

    // E-posta içeriği
    const mailOptions = {
      from: "ismayilhebibov01@gmail.com",
      to: email,
      subject: "Təsdiqləmə kodu",
      text: `Profil.az üçün təsdiqləmə kodunuz: ${otp}`,
    };

    // OTP'yi e-posta olarak gönder
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Təsdiqləmə kodu göndərildi" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Təsdiqləmə kodu göndərilmədi" });
  }
});


router.post("/company-register", async (req, res) => {
  const { companyName, email, password, otp } = req.body;

  try {
    // OTP'yi veritabanında kontrol et
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "Təsdiqləmə kodun vaxtı bitmişdir" });
    }

    // OTP'nin doğru olup olmadığını kontrol et
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Yalnış təsdiqləmə kodu" });
    }

    // OTP'yi veritabanından sil
    await OTP.deleteOne({ email });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni şirketi oluştur
    const newCompany = new Company({
      companyName,
      email,
      password: hashedPassword,
      userType:"company"
    });

    await newCompany.save();
    res.status(201).json({ message: "Qeydiyyat uğurla tamamlandı" });
  } catch (error) {
    res.status(500).json({ message: "Şəbəkə xətası", error: error.message });
  }
});




module.exports = router;
