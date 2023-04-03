const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Pc = require("../models/pcModel");
const nodemailer = require("../config/nodemailer.config");
const Department = require("../models/departmentModel");
const Supplier = require("../models/supplierModel");
// ----------------------------------------------------------------
const Purchase = require("../models/purchaseModel");
const Recurring = require("../models/recurringModel");
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

// const xlsx = require("node-xlsx");

const xlsx = require("xlsx");
const chmodr = require("chmodr");

const loginPc = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Pc.findOne({ email });

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
      console.log("Hello at pccontroller before setting cookie");

      res.cookie("jwtokenpc", token, {
        expires: new Date(Date.now() + 86400000),
        sameSite: "none",
        domain: ".vercel.app",
        httpOnly: true,
        path: "/",
      });

      console.log("Hello at pccontroller after setting cookie");
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

const registerPc = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const userExists = await Pc.findOne({ email });

    if (userExists) {
      res.json({ message: "User Already Exists" });
    }

    // Hash Password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create User

    const user = await Pc.create({
      name,
      email,
      department,
      password: hashedPassword,
      status: "Pending",
    });

    if (user) {
      const token = await user.generateAuthToken();
      console.log(`Generated by signup ${token}`);

      await user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        console.log("E-mail information of user: ");

        console.log(user.name);
        console.log(user.email);
        console.log(user.token);

        nodemailer.sendConfirmationEmail(user.name, user.email, user.tokens);
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

    const pcs = await Pc.find({ status });
    if (!pcs) {
      res.json({ message: "No pending Pc" });
    } else {
      res.json({ message: "Pc Details", pcs: pcs });
    }
  } catch (error) {
    console.log(error);
  }
};

const makeActive = async (req, res) => {
  try {
    const { email } = req.body;

    Pc.findOne({ email }, (err, pc) => {
      if (err) return res.status(500).send(err);

      if (pc.status === "Pending") {
        pc.status = "Active";
      }

      pc.save((err, pcs) => {
        if (err) return res.status(500).send(err);
        nodemailer.sendActivationEmail(pcs.name, pcs.email, pcs.tokens);
        res.send(pcs);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const logoutPc = async (req, res) => {
  try {
    res.clearCookie("jwtokenpc", { path: "/" });
    res.status(200).send("user logout");
  } catch (error) {
    console.log(error);
  }
};

const getPcInfo = async (req, res) => {
  try {
    const { _id, name, department, email } = await Pc.findById(req.user._id);
    res.status(200).json({
      _id: _id,
      name: name,
      department: department,
    });
  } catch (error) {
    console.log(error);
  }
};

const deletePc = async (req, res) => {
  try {
    const { email } = req.body;

    const pc = await Pc.findOne({ email });

    if (!pc) {
      res.status(400);
      console.log("Pc not found to be deleted");
    }
    nodemailer.sendDeclineEmail(pc.name, pc.email, pc.token);
    await pc.remove();

    return res.status(404).json({ message: "Pc deleted" });
  } catch (error) {
    console.log(error);
  }
};

const getdept = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json({
      depts: depts,
    });
  } catch (error) {
    console.log(error);
  }
};

const addSupplier = async (req, res) => {
  try {
    const { supplier, address, contact } = req.body;

    const existingSupplier = await Supplier.findOne({ supplier, address });
    if (existingSupplier) {
      return res.json({ message: "Duplicate" });
    }

    await Supplier.create({
      supplier,
      address,
      contact,
    });

    res.json({ message: `Supplier added + ${supplier}` });
  } catch (error) {
    console.log(error);
    res.json({ message: "Duplicate" });
  }
};

const getSupplier = async (req, res) => {
  try {
    const supp = await Supplier.find();
    res.json({
      supp: supp,
    });
  } catch (error) {
    /* console.log(error); */
  }
};

const delSupplier = async (req, res) => {
  try {
    const { supplier } = req.body;
    const supp = await Supplier.findOne({ supplier });
    if (!supp) {
      return res.status(400).json({ message: "Supplier not found" });
    }
    await supp.remove();

    return res.status(404).json({ message: "supplier deleted" });
  } catch (error) {
    console.log(error);
  }
};

// ===========================================================================
// upload purchase file
const uploadFile = async (req, res) => {
  const department = req.query.department;
  if (department === "") {
    res.send({ message: "Please reload the page" });
  } else {
    const files = [];
    try {
      if (Array.isArray(req.files.uploads) && req.files.uploads.length > 0) {
        //checking if req.files.uploads is array and it exist or not
        for (let file of req.files.uploads) {
          files.push(file); //pushing each file into files array
        }
      }
    } catch (error) {
      return res.status(401).json({ message: "File Array not Uploaded" });
    }

    for (var k = 0; k < files.length; k++) {
      //loop to iterate through all files in files array
      console.log(files[k].filename);
      //for pushing json to database
      try {
        // console.log(process.cwd()); F:\mehul study\React\sdp project\Purchase and Repair
        const path1 = path.join(
          __dirname,
          "../../",
          "/public/files/" + files[k].filename
        );
        // console.log(path1); F:\mehul study\React\sdp project\Purchase and Repair\public\files\1677520009765new.xlsx
        let xlFile = xlsx.readFile(path1);
        let sheet = xlFile.Sheets[xlFile.SheetNames[0]];
        const P_JSON = xlsx.utils.sheet_to_json(sheet);
        console.log(P_JSON.length);

        for (var p = 0; p < P_JSON.length; p++) {
          var date = new Date((P_JSON[p].Invoice_Date - 25569) * 86400 * 1000);
          var formattedDate = date.toLocaleDateString("en-GB");

          P_JSON[p].Invoice_Date = formattedDate;

          date = new Date((P_JSON[p].PO_Date - 25569) * 86400 * 1000);
          formattedDate = date.toLocaleDateString("en-GB");

          P_JSON[p].PO_Date = formattedDate;

          if (
            P_JSON[p].Supplier_Name != "" &&
            P_JSON[p].Supplier_Name !== undefined
          ) {
            try {
              const existingSupplier = await Supplier.findOne({
                supplier: P_JSON[p].Supplier_Name,
                address: P_JSON[p].Address,
              });
              if (!existingSupplier) {
                await Supplier.create({
                  supplier: P_JSON[p].Supplier_Name,
                  address: P_JSON[p].Address,
                  contact: P_JSON[p].Contact,
                });
              }
            } catch (error) {
              console.log(error);
            }
          }

          P_JSON[p].Department = department;
          console.log(P_JSON[p].Department);
        }
        var allrecord = [];
        for (var i = 0; i < P_JSON.length; i++) {
          allrecord[i] = P_JSON[i].Sr_No;
        }
        var pp = "";
        try {
          const pp = await Purchase.insertMany(P_JSON, { ordered: false });
          var printline = [];
          for (var i = 0; i < pp.length; i++) {
            printline[i] = pp[i].Sr_No;
          }
          console.log(pp);
          res
            .status(200)
            .json({ message: "Data entered successfully", ps: printline });
        } catch (error) {
          if (error.writeErrors) {
            const duplicateErrors = error.writeErrors;

            const pr = [];
            var print = "Sr_no ";
            for (var i = 0; i < duplicateErrors.length; i++) {
              print = print + duplicateErrors[i].err.op.Sr_No;
              pr[i] = duplicateErrors[i].err.op.Sr_No;
              if (i !== duplicateErrors.length - 1) {
                print = print + " , ";
              }
            }
            const allrec = Array.from(allrecord, (x) => `${x}`);

            console.log(pr);
            console.log(allrec);
            pp = allrec.filter((x) => !pr.includes(x));
            console.log("pppp" + pp);
            print =
              print + " has been failed to entered as duplicate records found";
            res.send({
              message: "Duplicate key found",
              pe: print,
              ps: pp,
            });
          }
        }

        chmodr("./", 0o777, (err) => {
          //giving permission to read,write and execute to current folder
          if (err) {
            console.log("Failed to execute chmod", err);
          } else {
          }
        });

        fs.rmSync("./public/files", { recursive: true, force: true }); // deleting files folder for saving space
      } catch (error) {
        chmodr("./", 0o777, (err) => {
          if (err) {
            console.log("Failed to execute chmod", err);
          } else {
          }
        });
        console.log("Hi " + error);
        fs.rmSync("./public/files", { recursive: true, force: true });
      }
    }
  }
};
// -------------------------------------------------------------
// download purchase file
const downloadfile = async (req, res) => {
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

  var wb = xlsx.utils.book_new();

  Purchase.find(query, null, options)
    .select("-_id -Department")
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

// ==============================================================
// Upload repair file
const uploadRepairFile = async (req, res) => {
  const department = req.query.department;
  console.log("Department from upload" + department);
  const files = [];
  try {
    if (Array.isArray(req.files.uploads) && req.files.uploads.length > 0) {
      //checking if req.files.uploads is array and it exist or not
      for (let file of req.files.uploads) {
        files.push(file); //pushing each file into files array
      }
    }
  } catch (error) {
    return res.status(401).json({ message: "File Array not Uploaded" });
  }

  for (var k = 0; k < files.length; k++) {
    //loop to iterate through all files in files array
    console.log(files[k].filename);
    //for pushing json to database
    try {
      // console.log(process.cwd()); F:\mehul study\React\sdp project\Purchase and Repair
      const path1 = path.join(
        __dirname,
        "../../",
        "/public/files/" + files[k].filename
      );
      // console.log(path1); F:\mehul study\React\sdp project\Purchase and Repair\public\files\1677520009765new.xlsx
      let xlFile = xlsx.readFile(path1);
      let sheet = xlFile.Sheets[xlFile.SheetNames[0]];
      const P_JSON = xlsx.utils.sheet_to_json(sheet);
      console.log(P_JSON.length);
      for (var p = 0; p < P_JSON.length; p++) {
        var date = new Date((P_JSON[p].Date - 25569) * 86400 * 1000);
        var formattedDate = date.toLocaleDateString("en-US");

        P_JSON[p].Date = formattedDate;
        console.log("Recurring date" + P_JSON[p].Receivng_date);
        date = new Date((P_JSON[p].Receivng_date - 25569) * 86400 * 1000);
        console.log("Recurring date" + date);
        formattedDate = date.toLocaleDateString("en-US");

        P_JSON[p].Receivng_date = formattedDate;
        if (
          P_JSON[p].Name_Of_Supplier != "" &&
          P_JSON[p].Name_Of_Supplier !== undefined
        ) {
          try {
            const existingSupplier = await Supplier.findOne({
              supplier: P_JSON[p].Supplier_Name,
              address: P_JSON[p].Address,
            });
            if (!existingSupplier) {
              await Supplier.create({
                supplier: P_JSON[p].Supplier_Name,
                address: P_JSON[p].Address,
                contact: P_JSON[p].Contact,
              });
            }
          } catch (error) {
            /* console.log(error); */
          }
        }
        P_JSON[p].Department = department;
        console.log(P_JSON[p].Department);
      }

      var allrecord = [];
      for (var i = 0; i < P_JSON.length; i++) {
        allrecord[i] = P_JSON[i].Sr_No;
      }
      var pp = "";

      try {
        const pp = await Recurring.insertMany(P_JSON, { ordered: false });
        var printline = [];
        for (var i = 0; i < pp.length; i++) {
          printline[i] = pp[i].Sr_No;
        }
        console.log(pp);
        res
          .status(200)
          .json({ message: "Data entered successfully", ps: printline });
      } catch (error) {
        if (error.writeErrors) {
          const duplicateErrors = error.writeErrors;

          const pr = [];
          var print = "Sr_no ";
          for (var i = 0; i < duplicateErrors.length; i++) {
            print = print + duplicateErrors[i].err.op.Sr_No;
            pr[i] = duplicateErrors[i].err.op.Sr_No;
            if (i !== duplicateErrors.length - 1) {
              print = print + " , ";
            }
          }
          const allrec = Array.from(allrecord, (x) => `${x}`);

          console.log(pr);
          console.log(allrec);
          pp = allrec.filter((x) => !pr.includes(x));
          console.log("pppp" + pp);
          print =
            print + " has been failed to entered as duplicate records found";
          res.send({
            message: "Duplicate key found",
            pe: print,
            ps: pp,
          });
        }
      }

      chmodr("./", 0o777, (err) => {
        //giving permission to read,write and execute to current folder
        if (err) {
          console.log("Failed to execute chmod", err);
        } else {
        }
      });

      fs.rmSync("./public/files", { recursive: true, force: true }); // deleting files folder for saving space
    } catch (error) {
      chmodr("./", 0o777, (err) => {
        if (err) {
          console.log("Failed to execute chmod", err);
        } else {
        }
      });
      console.log(error);
      fs.rmSync("./public/files", { recursive: true, force: true });
    }
  }
};
// ------------------------------------------------------------
// download repair file
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
    .select("-_id -Department")
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
// =============================================================================
// Get all purchase data
const getpurchase = async (req, res) => {
  try {
    const department = req.query.department; // get the department from the query parameter
    const files = await Purchase.find({ Department: department }); // use the find method with the department query
    res.json({
      files: files,
    });
  } catch (error) {
    console.log(error);
  }
};

// =============================================================================
// Get all repair data
const getrepair = async (req, res) => {
  try {
    const department = req.query.department;
    const files = await Recurring.find({ Department: department });
    res.json({
      files: files,
    });
  } catch (error) {
    console.log(error);
  }
};
// =================================================================================
// Insert purchase data by form
const formpurchase = async (req, res) => {
  try {
    const {
      Sr_No,
      Academic_Year,
      Item,
      Description,
      Quantity,
      Total_Quantity,
      Price,
      Total,
      Bill_No,
      Invoice_Date,
      PO_No,
      PO_Date,
      Supplier_Name,
      Address,
      Contact,
      Department,
    } = req.body;

    await Purchase.create({
      Sr_No,
      Academic_Year,
      Item,
      Description,
      Quantity,
      Total_Quantity,
      Price,
      Total,
      Bill_No,
      Invoice_Date,
      PO_No,
      PO_Date,
      Supplier_Name,
      Address,
      Contact,
      Department,
    });

    res.json({ message: `Data inserted in purchase database` });
  } catch (error) {
    console.log(error);
    res.json({ message: `Duplicate data` });
  }
};
// =================================================================================
// Insert repair data by form

const formrepair = async (req, res) => {
  try {
    const {
      Sr_No,
      Description_of_Material,
      Name_Of_Supplier,
      Bill_No,
      Date,
      Amount,
      Material,
      Receiving_Year,
      Year,
      Yearly_expense,
      // Address,
      // Contact,
      Department,
    } = req.body;

    await Recurring.create({
      Sr_No,
      Description_of_Material,
      Name_Of_Supplier,
      Bill_No,
      Date,
      Amount,
      Material,
      Receiving_Year,
      Year,
      Yearly_expense,
      // Address,
      // Contact,
      Department,
    });

    res.json({ message: `Data inserted in recurring database` });
  } catch (error) {
    console.log(error);
    res.json({ message: `Duplicate data` });
  }
};

const updatepurchase = async (req, res) => {
  try {
    const {
      _id,
      Sr_No,
      Academic_Year,
      Item,
      Description,
      Quantity,
      Total_Quantity,
      Price,
      Total,
      Bill_No,
      Invoice_Date,
      PO_No,
      PO_Date,
      Supplier_Name,
      Address,
      Contact,
      Department,
    } = req.body;

    const updatedDocument = await Purchase.findByIdAndUpdate(
      _id,
      {
        Sr_No,
        Academic_Year,
        Item,
        Description,
        Quantity,
        Total_Quantity,
        Price,
        Total,
        Bill_No,
        Invoice_Date,
        PO_No,
        PO_Date,
        Supplier_Name,
        Address,
        Contact,
        Department,
      },
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: `Data inserted in recurring database` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updaterepair = async (req, res) => {
  try {
    const {
      _id,
      Sr_No,
      Description_of_Material,
      Name_Of_Supplier,
      Bill_No,
      Date,
      Amount,
      Material,
      Receiving_Year,
      Year,
      Yearly_expense,
      // Address,
      // Contact,
      Department,
    } = req.body;

    const updatedDocument = await Recurring.findByIdAndUpdate(
      _id,
      {
        Sr_No,
        Description_of_Material,
        Name_Of_Supplier,
        Bill_No,
        Date,
        Amount,
        Material,
        Receiving_Year,
        Year,
        Yearly_expense,
        Department,
      },
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: `Data inserted in recurring database` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
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
// ===================================================================
// Delete row purchase
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
const deleteRowRepair = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const row = await Recurring.findOne({ _id: id });
    console.log(row);
    if (!id) {
      return res.status(400).json({ message: "Data not found" });
    }
    await row.remove();

    return res.status(404).json({ message: "Data deleted" });
  } catch (error) {
    console.log(error);
  }
};
const deleteRowRepairMany = async (req, res) => {
  try {
    const { ids } = req.body;
    const rows = await Recurring.find({ _id: { $in: ids } });

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
  loginPc,
  registerPc,
  getAllPending,
  makeActive,
  logoutPc,
  getPcInfo,
  deletePc,
  getdept,
  addSupplier,
  getSupplier,
  delSupplier,
  uploadFile,
  downloadfile,
  uploadRepairFile,
  downloadrepairfile,
  getpurchase,
  getrepair,
  formpurchase,
  formrepair,
  searchPurchase,
  searchRepair,
  deleteRow,
  deleteRowMany,
  deleteRowRepair,
  deleteRowRepairMany,
  updaterepair,
  updatepurchase,
};
