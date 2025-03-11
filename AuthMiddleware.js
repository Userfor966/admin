const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
    console.log("Gelen Çerezler:", req.cookies); // Çerezleri kontrol et
    console.log("Gelen Token:", req.cookies.token); // Token doğru geliyor mu?
  
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Yetkisiz erişim! Token bulunamadı." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id }; // Hata: req.user.id yerine objeyi doğrudan oluştur!
      console.log("Doğrulanan Kullanıcı ID:", decoded.id);
      next();
    } catch (error) {
      console.error("JWT Doğrulama Hatası:", error.message);
      return res.status(401).json({ message: "Geçersiz token!" });
    }
  };
  module.exports=authMiddleware