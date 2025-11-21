const Product = require("../models/Product");

class ProductRepository {
  async create(data) {
    return Product.create(data);
  }
  async findById(id) {
    return Product.findById(id);
  }
  async update(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }
  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
  async list(filter = {}) {
    return Product.find(filter);
  }
}

module.exports = new ProductRepository();
