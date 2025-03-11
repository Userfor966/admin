const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Yetkisiz erişim! Token bulunamadı." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id }; // Hata: req.user.id yerine objeyi doğrudan oluştur!
      next();
    } catch (error) {
      return res.status(401).json({ message: "Geçersiz token!" });
    }
  };
  module.exports=authMiddleware