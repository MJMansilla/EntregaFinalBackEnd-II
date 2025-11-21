const User = require("../models/User");

class UserRepository {
  async findById(id) {
    return User.findById(id);
  }
  async findByEmail(email) {
    return User.findOne({ email });
  }
  async create(data) {
    const u = new User(data);
    return u.save();
  }
  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true });
  }
  async setResetToken(id, tokenHash, expiry) {
    return User.findByIdAndUpdate(
      id,
      { resetTokenHash: tokenHash, resetTokenExpiry: expiry },
      { new: true }
    );
  }
  async clearResetToken(id) {
    return User.findByIdAndUpdate(
      id,
      { $unset: { resetTokenHash: "", resetTokenExpiry: "" } },
      { new: true }
    );
  }
}

module.exports = new UserRepository();
