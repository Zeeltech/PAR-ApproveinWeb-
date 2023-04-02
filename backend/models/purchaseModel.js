const mongoose = require("mongoose");

const purchase = mongoose.Schema(
  {
    Sr_No: { type: String, required: true },
    Purchase_Recurring: { type: String, default: "Purchase" },
    Academic_Year: { type: String, default: "" },
    Item: { type: String, default: "" },
    Description: { type: String, default: "" },
    Quantity: { type: String, default: "" },
    Total_Quantity: { type: String, default: "" },
    Price: { type: Number, default: "" },
    Total: { type: String, default: "" },
    Bill_No: { type: String, default: "" },
    Invoice_Date: { type: String, default: "" },
    PO_No: { type: String, default: "" },
    PO_Date: { type: String, default: "" },
    Supplier_Name: { type: String, default: "" },
    Address: { type: String, default: "" },
    Contact: { type: String, default: "" },
    Department: { type: String, default: "" },
  },
  {
    versionKey: false,
  }
);

purchase.index({ Sr_No: 1, Department: 1 }, { unique: true }); //SOLVED Departmentwise sr_no

module.exports = mongoose.model("Purchase", purchase);
