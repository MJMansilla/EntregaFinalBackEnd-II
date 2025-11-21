const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [{ productId: String, quantity: Number, price: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
