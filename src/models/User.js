const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    role: { type: String, default: "user", enum: ["user", "admin"] },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    const hashed = bcrypt.hashSync(user.password, 10);
    user.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

// Metodo de instancia para validar contraseñas
UserSchema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
