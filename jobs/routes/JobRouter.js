const express = require("express");
const bcrypt = require("bcrypt");
const Job = require("../schemas/JobSchema");
const router = express.Router();
const twilio = require("twilio"); // Twilio ile OTP göndermek için
const jwt = require("jsonwebtoken"); // OTP doğrulama için
const Otp=require("../../otps/OtpSchema")
const nodemailer = require('nodemailer');
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "3a55b94f7bedae66c30b544b4c044ea8d7790ef693b138012011441763c2c83fca2eebd0a253db4a5c63e5d00f1c05f040512df5f3ad124bf2e1b3af9fd220c5";

// Twilio ayarları (Twilio hesap bilgilerinizi .env dosyanıza koymalısınız)


router.get("/getJobs", async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// OTP GÖNDERME ENDPOINTİ
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// 📌 OTP GÖNDERME ROTASI
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

// OTP Gönderme (E-posta ile)
router.post("/send-job-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "E-posta adresi gereklidir." });

    // 4 haneli rastgele OTP oluştur
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Önceki OTP'yi sil (aynı e-posta için yeniden oluşturuluyor)
    await Otp.deleteOne({ email });

    // Yeni OTP'yi veritabanına kaydet (5 dakika geçerli)
    const newOtp = new Otp({ email, otp: otpCode, createdAt: new Date() });
    await newOtp.save();

    // E-posta ile OTP gönderme
    await transporter.sendMail({
      from: "ismayilhebibov01@gmail.com",
      to: email,
      subject: "İş İlanı OTP Kodu",
      text: `İş ilanı eklemek için OTP kodunuz: ${otpCode}`,
    });

    res.status(200).json({ message: "OTP başarıyla e-posta adresinize gönderildi!" });
  } catch (error) {
    console.error("OTP Gönderme Hatası:", error);
    res.status(500).json({ message: "OTP gönderme hatası", error: error.message });
  }
});

// İş ilanı ekleme ve OTP doğrulama
router.post("/addjob", async (req, res) => {
  try {
    const { title, salary,category, description, city, email,phone, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "E-posta ve OTP gerekli." });

    // OTP kontrolü
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: "OTP kodu yanlış veya süresi doldu." });
    }

    // İş ilanını kaydet
    const newJob = new Job({
      title,
      category,
      salary,
      email,
      phone,
      description,
      city,
    });

    await newJob.save();

    // OTP'yi DB'den sil (tekrar kullanım engellenir)
    await Otp.deleteOne({ email });

    res.status(201).json({ message: "İş ilanı başarıyla eklendi!" });
  } catch (error) {
    console.error("İş ilanı ekleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});


router.get("/job/:id", async (req, res) => {
  try {
    const jobId = req.params.id; // URL'den ID'yi al

    // İş ilanını bul ve görüntüleme sayacını artır
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { viewCount: 1 } }, // viewCount değerini 1 artır
      { new: true } // Güncellenmiş veriyi döndür
    );

    if (!job) {
      return res.status(404).json({ message: "Job bulunamadı!" });
    }

    res.status(200).json(job); // Güncellenmiş ilanı dön
  } catch (error) {
    console.error("Job getirirken hata:", error);
    res.status(500).json({ message: "Server hatası", error: error.message });
  }
});

module.exports = router;
