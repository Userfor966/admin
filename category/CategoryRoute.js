const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Category= require("./CategorySchema");
const router = express.Router();






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


router.post("/add-category", async (req, res) => {
    const { categoryName } = req.body;
  
    try {
      // Yeni kategori oluşturma
      const newCategory = new Category({
        categoryName,
        subcategories: [], // Subcategory'yi eklemiyoruz burada
      });
  
      // Kategoriyi kaydet
      await newCategory.save();
  
      res.status(201).json({
        message: "Kategori başarıyla oluşturuldu!",
        category: newCategory,
      });
    } catch (error) {
      console.error("Kategori oluşturulurken hata oluştu:", error);
      res.status(500).json({
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        error: error.message,
      });
    }
  });

  router.post("/add-subcategory", upload.single("banner"), async (req, res) => {
    console.log(req.body)
    const { categoryId, subcategoryName } = req.body;
  
    // Subcategory ve banner verilerini al
    const banner = req.file ? req.file.path : null;
  
    try {
      // Subcategory için mevcut kategoriyi bul
      const category = await Category.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ message: "Kategori bulunamadı!" });
      }
  
      // Subcategory'yi ekle
      const subcategory = { name: subcategoryName, banner };
  
      category.subcategories.push(subcategory);
  
      // Kategoriyi güncelle ve kaydet
      await category.save();
  
      res.status(201).json({
        message: "Subkategori başarıyla oluşturuldu!",
        subcategory,
      });
    } catch (error) {
      console.error("Subkategori oluşturulurken hata oluştu:", error);
      res.status(500).json({
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        error: error.message,
      });
    }
  });

  // Kategorileri getirme rotası
router.get("/categories", async (req, res) => {
    try {
      // Tüm kategorileri ve alt kategorileri almak
      const categories = await Category.find();
  
      if (!categories || categories.length === 0) {
        return res.status(404).json({ message: "Kategori bulunamadı!" });
      }
  
      res.status(200).json({
        message: "Kategoriler başarıyla getirildi!",
        categories,
      });
    } catch (error) {
      console.error("Kategoriler alınırken hata oluştu:", error);
      res.status(500).json({
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        error: error.message,
      });
    }
  });
  

module.exports = router;
