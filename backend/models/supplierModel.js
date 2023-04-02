const mongoose = require("mongoose");

const supplier = mongoose.Schema({
  supplier: { type: String, required: true },
  address: { type: String, required: true, default: "" },
  contact: { type: String, default: "" },
});

module.exports = mongoose.model("Supplier", supplier);
