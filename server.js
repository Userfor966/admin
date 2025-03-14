require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(cors({
  origin:'http://localhost:3000',
  methods: ['GET', 'POST','PATCH','PUT','DELETE'],
  credentials: true,  
}));
app.use(cookieParser())





mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));


const ProfileRoute=require('./users/routes/ProfileRoute')
const UserRoute=require('./users/routes/UserRoute')
const GetUsers=require("./users/routes/GetUsers")
const AddCategory=require("./category/CategoryRoute")

app.use('/',UserRoute)
app.use("/",GetUsers)
app.use("/",AddCategory)
app.use("/",ProfileRoute)


// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});
