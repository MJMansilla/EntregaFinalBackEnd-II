const Cart = require("../models/Cart");

class CartRepository {
  async findById(id) {
    return Cart.findById(id);
  }
  async create(data) {
    return Cart.create(data);
  }
  async update(id, data) {
    return Cart.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new CartRepository();
