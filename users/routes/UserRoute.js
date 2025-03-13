const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const User = require("../schema/UserSchema");
const Company=require("../../company/CompanySchema")
const OTP=require("../../otps/OtpSchema")
const jwt = require('jsonwebtoken'); 
const router = express.Router();
const nodemailer = require('nodemailer');
const authMiddleware=require("../../AuthMiddleware")
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


router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Email'in daha önce kullanılıp kullanılmadığını kontrol et
    const existingCompany = await Company.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingCompany || existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Daha önce gönderilmiş OTP var mı?
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP) {
      return res.status(400).json({ message: "OTP already sent. Please try again later." });
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
    console.log("OTP email sent");

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


router.post("/register", async (req, res) => {
  const { firstName, lastName, phone, email, password, otp } = req.body;

  try {
    // OTP'yi veritabanında kontrol et
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found" });
    }

    // OTP'nin doğru olup olmadığını kontrol et
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP'yi veritabanından sil
    await OTP.deleteOne({ email });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı oluştur
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      isOpen: false,
      userType:"jobseeker"
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Delete profile 
router.post("/delete-account", authMiddleware, async (req, res) => {
  const { password } = req.body;
  const id = req.user.id;

  try {
    // Kullanıcıyı User koleksiyonunda ara
    const account = await User.findById(id);
    if (!account) return res.status(404).json({ message: "Hesab tapılmadı" });

    // Girilen şifreyi doğrula
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ message: "Şifrə yalnışdır" });

    // Hesabı sil
    await User.findByIdAndDelete(id);

    // Token'ı temizle
    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "lax" });
    res.status(200).json({ message: "Hesab uğurla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Şəbəkə xətası", error: error.message });
  }
});




//Login endpoint 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sadece User koleksiyonunda ara
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Şifreyi doğrula
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT oluştur
    const token = jwt.sign(
      { id: user._id, email: user.email, type: "user" }, // Artık sadece "user" tipi var
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
    });

    res.status(200).json({ message: "Login successful"});
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/verify-token", authMiddleware, async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ valid: false, message: "Token not found" });
  }

  try {
    // JWT token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Sadece User koleksiyonunda ara
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      return res.json({
        isOwner: true,
        user: user.toObject(),
      });
    } else {
      return res.status(404).json({ valid: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
});



module.exports = router;
