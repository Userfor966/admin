const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: { type: String },
  subcategories: [
    {
      name: { type: String },
      banner: { type: String },
    }
  ]
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;