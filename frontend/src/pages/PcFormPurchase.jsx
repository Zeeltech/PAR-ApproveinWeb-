import axios from "axios";
import React, { useEffect, useState } from "react";
import HeaderPc from "../components/HeaderPc";
import PcSidebarPurchase from "../components/PcSidebarPurchase";
import { ToastContainer, toast } from "react-toastify";

function PcFormPurchase() {
  const [all, setAll] = useState([]); //get all supplier name,address,contact
  const [department, setDepartment] = useState("");
  useEffect(() => {
    axios
      .get("http://localhost:5000/pc/getsupp", { withCredentials: true })
      .then((response) => setAll(response.data.supp));
  });
  useEffect(() => {
    axios
      .get("http://localhost:5000/pc/getme", {
        withCredentials: true,
      })
      .then((response) => {
        setDepartment(response.data.department);
      });
  });
  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierContact, setSupplierContact] = useState("");

  const [formData, setFormData] = useState({
    Sr_No: "",
    Academic_Year: "",
    Item: "",
    Description: "",
    Quantity: "",
    Total_Quantity: "",
    Price: "",
    Total: "",
    Bill_No: "",
    Invoice_Date: "",
    PO_No: "",
    PO_Date: "",
    Supplier_Name: "",
    Address: "",
    Contact: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios
      .post(
        "http://localhost:5000/pc/formpurchase",
        {
          Sr_No: formData.Sr_No,
          Academic_Year: formData.Academic_Year,
          Item: formData.Item,
          Description: formData.Description,
          Quantity: formData.Quantity,
          Total_Quantity: formData.Total_Quantity,
          Price: formData.Price,
          Total: formData.Total,
          Bill_No: formData.Bill_No,
          Invoice_Date: formData.Invoice_Date,
          PO_No: formData.PO_No,
          PO_Date: formData.PO_Date,
          Supplier_Name: supplierName,
          Address: supplierAddress,
          Contact: supplierContact,
          Department: department,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.message === "Data inserted in purchase database") {
          toast.success("Form submitted successfully");
        } else if (response.data.message === "Duplicate data") {
          toast.error("Duplicate data");
        } else {
          toast.error("Error");
        }
      })
      .catch((error) => {
        console.log("Error is " + error);
      });
  };

  return (
    <>
      <ToastContainer />
      <HeaderPc />
      <PcSidebarPurchase />
      <div className="title-size text-color">
        Upload Purchase details via form
      </div>
      <div className="pc-form-main">
        <div className="pc-form-back">
          <div>
            <p className="form-text">Enter details of purchase</p>
            <form action="" className="box-grp">
              <div className="flex-form">
                <p className="form-text2">Sr no</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter  Sr no"
                  name="Sr_No"
                  value={formData.Sr_No}
                  onChange={handleInputChange}
                ></input>
              </div>
              <div className="flex-form">
                <p className="form-text2">Academic Year</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter  Academic Year"
                  name="Academic_Year"
                  value={formData.Academic_Year}
                  onChange={handleInputChange}
                ></input>
              </div>
              <div className="flex-form">
                <p className="form-text2">Item</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Item"
                  name="Item"
                  value={formData.Item}
                  onChange={handleInputChange}
                ></input>
              </div>
              <div className="flex-form">
                <p className="form-text2">Description</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Description"
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                ></input>
              </div>
              <div className="flex-form">
                <p className="form-text2">Quantity</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Quantity"
                  name="Quantity"
                  value={formData.Quantity}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">Total Quantity</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Total Quantity"
                  name="Total_Quantity"
                  value={formData.Total_Quantity}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">Price</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Price"
                  name="Price"
                  value={formData.Price}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">Total</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Total"
                  name="Total"
                  value={formData.Total}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">Bill No</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Bill No"
                  name="Bill_No"
                  value={formData.Bill_No}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">Invoice Date</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter Invoice_Date in dd/mm/yyyy format"
                  name="Invoice_Date"
                  value={formData.Invoice_Date}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">PO No</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter PO No"
                  name="PO_No"
                  value={formData.PO_No}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">PO Date</p>
                <input
                  className="pc-form-box"
                  type="text"
                  placeholder="Enter PO_Date in dd/mm/yyyy format"
                  name="PO_Date"
                  value={formData.PO_Date}
                  onChange={handleInputChange}
                ></input>
              </div>

              <div className="flex-form">
                <p className="form-text2">Supplier</p>
                <select
                  className="form-dropdown"
                  onChange={(event) => {
                    // console.log(event.target.value);
                    console.log(event.target.value);
                    if (event.target.value === "Select supplier") {
                      setSupplierName("");
                      setSupplierAddress("");
                      setSupplierContact("");
                    } else {
                      const selectedSupplier = event.target.value;
                      const selectedSupplierObject = all.find(
                        (supp) => supp._id === selectedSupplier
                      );
                      console.log(selectedSupplierObject);
                      setSupplierName(selectedSupplierObject.supplier);
                      setSupplierAddress(selectedSupplierObject.address);
                      setSupplierContact(selectedSupplierObject.contact);
                    }
                  }}
                >
                  <option>Select supplier</option>
                  {all.map((supp) => (
                    <option key={supp._id} value={supp._id}>
                      {supp.supplier} ({supp.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="pc-form-box new"
                  id="submit-btn"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default PcFormPurchase;
