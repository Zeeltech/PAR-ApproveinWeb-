const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Dean = require("../models/deanModel");
const nodemailer = require("../config/nodemailer.config");
const Purchase = require("../models/purchaseModel");
const Recurring = require("../models/recurringModel");
const xlsx = require("xlsx");
const path = require("path");
const Supplier = require("../models/supplierModel");

const loginDean = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Dean.findOne({ email });

    if (!user) {
      res.json({ message: "User not found" });
    } else if (user.status == "Pending") {
      res.json({ message: "Pending Status" });
    } else if (
      user &&
      (await bcrypt.compare(password, user.password)) &&
      user.status == "Active"
    ) {
      const token = await user.generateAuthToken();

      res.cookie("jwtokendean", token, {
        expires: new Date(Date.now() + 86400000),
        httpOnly: true,
      });

      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: token,
        message: "Successfully logged in",
      });
    } else {
      res.json({ message: "Invalid Password" });
    }
  } catch (error) {
    console.log(error);
  }
};

//==========================================================

const registerDean = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await Dean.findOne({ email });

    if (userExists) {
      res.json({ message: "User Already Exists" });
    }

    // Hash Password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create User

    const user = await Dean.create({
      name,
      email,
      password: hashedPassword,
      status: "Pending",
    });

    if (user) {
      const token = await user.generateAuthToken();

      await user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        console.log("E-mail information of user: ");

        console.log(user.name);
        console.log(user.email);
        console.log(user.token);

        nodemailer.sendConfirmationEmail(user.name, user.email, user.token);
        res.status(201).json({
          _id: user.id,
          name: user.name,
          email: user.email,
          token: token,
          message: "Successfully signed up",
        });
      });
    } else {
      res.status(400);
    }
  } catch (error) {
    console.log(error);
  }
};

const getAllPending = async (req, res) => {
  try {
    const { status } = req.body;

    const dean = await Dean.find({ status });
    if (!dean) {
      res.json({ message: "No pending Dean" });
    } else {
      res.json({ message: "Dean Details", dean: dean });
    }
  } catch (error) {
    console.log(error);
  }
};

const makeActive = async (req, res) => {
  try {
    const { email } = req.body;

    Dean.findOne({ email }, (err, dean) => {
      if (err) return res.status(500).send(err);

      if (dean.status === "Pending") {
        dean.status = "Active";
      }

      dean.save((err, dean) => {
        if (err) return res.status(500).send(err);
        nodemailer.sendActivationEmail(dean.name, dean.email, dean.token);
        res.send(dean);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const logoutDean = async (req, res) => {
  try {
    res.clearCookie("jwtokendean", { path: "/" });
    res.status(200).send("user logout");
  } catch (error) {
    console.log(error);
  }
};

const getDeanInfo = async (req, res) => {
  try {
    /*     console.log(req.user); */
    const { _id, name, email } = await Dean.findById(req.user._id);
    res.status(200).json({
      _id: _id,
      name: name,
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteDean = async (req, res) => {
  try {
    const { email } = req.body;

    const dean = await Dean.findOne({ email });

    if (!dean) {
      res.status(400);
      console.log("Dean not found to be deleted");
    }
    nodemailer.sendDeclineEmail(dean.name, dean.email, dean.token);
    await dean.remove();

    return res.status(404).json({ message: "Dean deleted" });
  } catch (error) {
    console.log(error);
  }
};

const downloadfile = async (req, res) => {
  const sr_no = req.query.sr_no;
  const price = req.query.price;
  const academic_year = req.query.academic_year;
  const description = req.query.description;
  const bill_no = req.query.bill_no;
  const po_no = req.query.po_no;
  const supplier = req.query.supplier;
  const item = req.query.item;
  const pricegreater = req.query.pricegreater;
  const pricelesser = req.query.pricelesser;
  const quantity = req.query.quantity;
  const totalquantity = req.query.totalquantity;
  const total = req.query.total;

  const query = {};
  if (sr_no) {
    query.Sr_No = sr_no;
  }
  if (price) {
    query.Price = price;
  }
  if (academic_year) {
    query.Academic_Year = academic_year;
  }

  if (description) {
    query.Description = description;
  }

  if (bill_no) {
    query.Bill_No = bill_no;
  }

  if (po_no) {
    query.PO_No = po_no;
  }

  if (supplier) {
    query.Supplier_Name = supplier;
  }

  if (quantity) {
    query.Quantity = quantity;
  }

  if (totalquantity) {
    query.Total_Quantity = totalquantity;
  }

  if (total) {
    query.Total = total;
  }
  console.log("Price is" + pricelesser);
  if (pricegreater && pricelesser) {
    query.Price = { $gte: pricelesser, $lte: pricegreater };
  } else if (pricegreater) {
    query.Price = { $lte: pricegreater };
  } else if (pricelesser) {
    query.Price = { $gte: pricelesser };
  }

  var searchKey;
  if (item) {
    searchKey = new RegExp(item, "i");
    query.Item = searchKey;
  }

  const options = {
    collation: { locale: "en", strength: 2 },
  };

  var wb = xlsx.utils.book_new();

  Purchase.find(query, null, options)
    .select("-_id")
    .exec((err, data) => {
      if (err) {
        console.log("Error : ", err);
      } else {
        // delete data["Department"];
        var temp = JSON.stringify(data); // Convert JSON to Json string
        temp = JSON.parse(temp); // Convert to object
        var ws = xlsx.utils.json_to_sheet(temp); // Convert Json Object into sheet of EXCEL
        xlsx.utils.book_append_sheet(wb, ws, "sheet1"); //Append sheets into wb
        xlsx.writeFile(
          //Now creating new file with unique name and writing EXCEL data to it
          wb,
          (path1 = path.join(
            __dirname,
            "../../",
            "/datafetcher/",
            `${Date.now()}` + "test.xlsx"
          ))
        );
        res.download(path1);
      }
    });
};

const downloadrepairfile = async (req, res) => {
  const department = req.query.department;
  const sr_no = req.query.sr_no;
  const academic_year = req.query.academic_year;
  const bill_no = req.query.bill_no;
  const supplier = req.query.supplier;
  const description = req.query.description;
  const material = req.query.material;
  const amountlesser = req.query.amountlesser;
  const amountgreater = req.query.amountgreater;
  const expenselesser = req.query.expenselesser;
  const expensegreater = req.query.expensegreater;

  // console.log("Amount less " + amountlesser);

  const query = {};
  if (sr_no) {
    query.Sr_No = sr_no;
  }
  if (department) {
    query.Department = department;
  }
  if (academic_year) {
    query.Year = academic_year;
  }

  if (bill_no) {
    query.Bill_No = bill_no;
  }

  if (supplier) {
    query.Name_Of_Supplier = supplier;
  }

  if (material) {
    query.Material = material;
  }

  if (amountlesser && amountgreater) {
    query.Amount = { $gte: amountlesser, $lte: amountgreater };
  } else if (amountgreater) {
    query.Amount = { $lte: amountgreater };
  } else if (amountlesser) {
    query.Amount = { $gte: amountlesser };
  }

  var searchKey;
  if (description) {
    searchKey = new RegExp(description, "i");
    query.Description_of_Material = searchKey;
  }

  if (expenselesser && expensegreater) {
    query.Yearly_expense = { $gte: expenselesser, $lte: expensegreater };
  } else if (expensegreater) {
    query.Yearly_expense = { $lte: expensegreater };
  } else if (expenselesser) {
    query.Yearly_expense = { $gte: expenselesser };
  }

  const options = {
    collation: { locale: "en", strength: 2 },
  };

  var wb = xlsx.utils.book_new();
  Recurring.find(query, null, options)
    .select("-_id")
    .exec((err, data) => {
      if (err) {
        console.log("Error : ", err);
      } else {
        var temp = JSON.stringify(data); // Convert JSON to Json string
        temp = JSON.parse(temp); // Convert to object
        var ws = xlsx.utils.json_to_sheet(temp); // Convert Json Object into sheet of EXCEL
        xlsx.utils.book_append_sheet(wb, ws, "sheet1"); //Append sheets into wb
        xlsx.writeFile(
          //Now creating new file with unique name and writing EXCEL data to it
          wb,
          (path1 = path.join(
            __dirname,
            "../../",
            "/datafetcher/",
            `${Date.now()}` + "test.xlsx"
          ))
        );
        res.download(path1);
      }
    });
};

const getpurchase = async (req, res) => {
  try {
    const files = await Purchase.find(); // use the find method with the department query
    res.json({
      files: files,
    });
  } catch (error) {
    console.log(error);
  }
};

const getrepair = async (req, res) => {
  try {
    const files = await Recurring.find();
    res.json({
      files: files,
    });
  } catch (error) {
    console.log(error);
  }
};

const searchPurchase = async (req, res) => {
  const department = req.query.department;
  const sr_no = req.query.sr_no;
  const price = req.query.price;
  const academic_year = req.query.academic_year;
  const description = req.query.description;
  const bill_no = req.query.bill_no;
  const po_no = req.query.po_no;
  const supplier = req.query.supplier;
  const item = req.query.item;
  const pricegreater = req.query.pricegreater;
  const pricelesser = req.query.pricelesser;
  const quantity = req.query.quantity;
  const totalquantity = req.query.totalquantity;
  const total = req.query.total;

  const query = {};
  if (sr_no) {
    query.Sr_No = sr_no;
  }
  if (department) {
    query.Department = department;
  }
  if (price) {
    query.Price = price;
  }
  if (academic_year) {
    query.Academic_Year = academic_year;
  }

  if (description) {
    query.Description = description;
  }

  if (bill_no) {
    query.Bill_No = bill_no;
  }

  if (po_no) {
    query.PO_No = po_no;
  }

  if (supplier) {
    query.Supplier_Name = supplier;
  }

  if (quantity) {
    query.Quantity = quantity;
  }

  if (totalquantity) {
    query.Total_Quantity = totalquantity;
  }

  if (total) {
    query.Total = total;
  }
  console.log("Price is" + pricelesser);
  if (pricegreater && pricelesser) {
    query.Price = { $gte: pricelesser, $lte: pricegreater };
  } else if (pricegreater) {
    query.Price = { $lte: pricegreater };
  } else if (pricelesser) {
    query.Price = { $gte: pricelesser };
  }

  var searchKey;
  if (item) {
    searchKey = new RegExp(item, "i");
    query.Item = searchKey;
  }

  const options = {
    collation: { locale: "en", strength: 2 },
  };

  try {
    const files = await Purchase.find(query, null, options);
    res.json({
      files: files,
    });
  } catch (error) {
    console.log(error);
  }
};

const searchRepair = async (req, res) => {
  const department = req.query.department;
  const sr_no = req.query.sr_no;
  const academic_year = req.query.academic_year;
  const bill_no = req.query.bill_no;
  const supplier = req.query.supplier;
  const description = req.query.description;
  const material = req.query.material;
  const amountlesser = req.query.amountlesser;
  const amountgreater = req.query.amountgreater;
  const expenselesser = req.query.expenselesser;
  const expensegreater = req.query.expensegreater;

  // console.log("Amount less " + amountlesser);

  const query = {};
  if (sr_no) {
    query.Sr_No = sr_no;
  }
  if (department) {
    query.Department = department;
  }
  if (academic_year) {
    query.Year = academic_year;
  }

  if (bill_no) {
    query.Bill_No = bill_no;
  }

  if (supplier) {
    query.Name_Of_Supplier = supplier;
  }

  if (material) {
    query.Material = material;
  }

  if (amountlesser && amountgreater) {
    query.Amount = { $gte: amountlesser, $lte: amountgreater };
  } else if (amountgreater) {
    query.Amount = { $lte: amountgreater };
  } else if (amountlesser) {
    query.Amount = { $gte: amountlesser };
  }

  var searchKey;
  if (description) {
    searchKey = new RegExp(description, "i");
    query.Description_of_Material = searchKey;
  }

  if (expenselesser && expensegreater) {
    query.Yearly_expense = { $gte: expenselesser, $lte: expensegreater };
  } else if (expensegreater) {
    query.Yearly_expense = { $lte: expensegreater };
  } else if (expenselesser) {
    query.Yearly_expense = { $gte: expenselesser };
  }

  const options = {
    collation: { locale: "en", strength: 2 },
  };

  try {
    const files = await Recurring.find(query, null, options);
    res.json({
      files: files,
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteRow = async (req, res) => {
  try {
    const { id } = req.body;
    // console.log(id);
    const row = await Purchase.findOne({ _id: id });
    // console.log(row);
    if (!id) {
      return res.status(400).json({ message: "Data not found" });
    }
    await row.remove();

    return res.status(404).json({ message: "Data deleted" });
  } catch (error) {
    console.log(error);
  }
};

const getSupplier = async (req, res) => {
  try {
    const supp = await Supplier.find();
    res.json({
      supp: supp,
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteRowMany = async (req, res) => {
  try {
    const { ids } = req.body;
    const rows = await Purchase.find({ _id: { $in: ids } });

    if (!rows) {
      return res.status(400).json({ message: "Data not found" });
    }

    // loop through the rows and delete each document
    for (let i = 0; i < rows.length; i++) {
      await rows[i].remove();
    }

    return res.status(404).json({ message: "Data deleted" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loginDean,
  registerDean,
  getAllPending,
  makeActive,
  getDeanInfo,
  logoutDean,
  deleteDean,
  downloadfile,
  downloadrepairfile,
  getpurchase,
  getrepair,
  searchPurchase,
  getSupplier,
  deleteRow,
  deleteRowMany,
  searchRepair,
};
