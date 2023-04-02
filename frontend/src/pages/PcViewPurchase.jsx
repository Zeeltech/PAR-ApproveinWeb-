import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import HeaderPc from "../components/HeaderPc";
import PcSidebarPurchase from "../components/PcSidebarPurchase";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { RiEdit2Line } from "react-icons/ri";
import { Oval } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";

const PcViewPurchase = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [files, setFiles] = useState([]);
  const [department, setDepartment] = useState("");
  const [sr_no, setSr_No] = useState("");
  const [academic_year, setAcademicYear] = useState("");
  const [description, setDescription] = useState("");
  const [bill_no, setBill_no] = useState("");
  const [po_no, setPO_no] = useState("");
  const [supplier, setSupplier] = useState("");
  const [all, setAll] = useState([]);
  const [item, setItem] = useState([]);
  const [pricegreater, setPricegreater] = useState("");
  const [pricelesser, setPricelesser] = useState("");
  const [quantity, setQuantity] = useState("");
  const [totalquantity, setTotalQuantity] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPop] = useState(false);

  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false); //Used in handleDeleteClick
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); //Used in handleDeleteClick

  const handleDeleteClick = (fileId, confirmDeleteValue) => {
    setConfirmDelete(confirmDeleteValue);
    setConfirmDeleteId(fileId);
  };

  const openPopup = (file) => {
    formData._id = file._id;
    formData.Sr_No = file.Sr_No;
    formData.Purchase_Recurring = file.Purchase_Recurring;
    formData.Academic_Year = file.Academic_Year;
    formData.Item = file.Item;
    formData.Description = file.Description;
    formData.Quantity = file.Quantity;
    formData.Total_Quantity = file.Total_Quantity;
    formData.Price = file.Price;
    formData.Total = file.Total;
    formData.Bill_No = file.Bill_No;
    formData.Invoice_Date = file.Invoice_Date;
    formData.PO_No = file.PO_No;
    formData.PO_Date = file.PO_Date;
    formData.Supplier_Name = supplierName;
    formData.Address = supplierAddress;
    formData.Contact = supplierContact;
    formData.Department = file.Department;

    setPop(!popup);
  };
  const closePopup = () => {
    setPop(false);
  };
  const [formData, setFormData] = useState({
    _id: "",
    Sr_No: "",
    Purchase_Recurring: "",
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
    Department: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const updateSubmit = async (event) => {
    event.preventDefault();
    setPop(false);

    await axios
      .post(
        `https://${process.env.BASE_URL}/pc/updatepurchase`,
        {
          _id: formData._id,
          Sr_No: formData.Sr_No,
          Purchase_Recurring: formData.Purchase_Recurring,
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
          Department: formData.Department,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.message === "Data inserted in purchase database") {
          toast.success("Detail update successfully");
        } else if (response.data.message === "Internal server error") {
          toast.error("Internal server error");
        } else {
          toast.error("Error");
        }
      })
      .then((res) => {
        window.location.reload("user/pc/purchase/view");
      })
      .catch((err) => {
        window.location.reload("user/pc/purchase/view");
        console.log("Error is " + err);
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.get(
      `https://${process.env.BASE_URL}/pc/downloadfile`,
      {
        responseType: "blob",
        params: {
          department: department,
          sr_no: sr_no,
          academic_year: academic_year,
          description: description,
          bill_no: bill_no,
          po_no: po_no,
          supplier: supplier,
          item: item,
          quantity: quantity,
          totalquantity: totalquantity,
          total: total,
          pricelesser: pricelesser,
          pricegreater: pricegreater,
        },
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${Date.now()}` + "test.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDelete = async (id) => {
    try {
      await axios
        .post(`https://${process.env.BASE_URL}/pc/deleterow`, {
          id: id,
        })
        .then((res) => {
          window.location.reload("user/pc/purchase/view");
        })
        .catch((err) => {
          window.location.reload("user/pc/purchase/view");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteMany = async () => {
    try {
      await axios
        .post(`https://${process.env.BASE_URL}/pc/deleterowmany`, {
          ids: selectedRows,
        })
        .then((res) => {
          window.location.reload("user/pc/purchase/view");
        })
        .catch((err) => {
          window.location.reload("user/pc/purchase/view");
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://${process.env.BASE_URL}/pc/getsupp`, {
        withCredentials: true,
      })
      .then((response) => {
        setAll(response.data.supp);
        return axios.get(`https://${process.env.BASE_URL}/pc/getme`, {
          withCredentials: true,
        });
      })
      .then((response) => {
        setDepartment(response.data.department);
        return axios.get(`https://${process.env.BASE_URL}/pc/searchpurchase`, {
          withCredentials: true,
          params: {
            department: response.data.department,
            sr_no: sr_no,
            academic_year: academic_year,
            description: description,
            bill_no: bill_no,
            po_no: po_no,
            supplier: supplier,
            item: item,
            quantity: quantity,
            totalquantity: totalquantity,
            total: total,
            pricelesser: pricelesser,
            pricegreater: pricegreater,
          },
        });
      })
      .then((response) => {
        setFiles(response.data.files);
        setLoading(false);
      });
  }, [
    department,
    sr_no,
    academic_year,
    description,
    bill_no,
    po_no,
    supplier,
    item,
    quantity,
    totalquantity,
    total,
    pricegreater,
    pricelesser,
  ]);

  return (
    <>
      <div>
        <HeaderPc />
        <PcSidebarPurchase />
        <ToastContainer />
        <div className="title-size text-color">Purchase data</div>
        {popup ? (
          <>
            <div className="main-popup">
              <div className="popup-pr">
                <div className="popup-header">
                  <div
                    className="title-size text-color"
                    style={{ textAlign: "center", marginLeft: "180px" }}
                  >
                    Update Recurring details
                  </div>
                  <div
                    className="transform hover:text-red-500 hover:scale-110"
                    onClick={() => closePopup()}
                  >
                    <AiOutlineClose
                      className="table-icons"
                      style={{ cursor: "pointer" }}
                    ></AiOutlineClose>
                  </div>
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
                                setSupplierName(
                                  selectedSupplierObject.supplier
                                );
                                setSupplierAddress(
                                  selectedSupplierObject.address
                                );
                                setSupplierContact(
                                  selectedSupplierObject.contact
                                );
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
                            onClick={updateSubmit}
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        <div className="min-h-screen">
          <div>
            <p className="text-color title-size"></p>
          </div>

          <div className="container table">
            <div className="overflow-x-auto">
              <div>
                <div className="w-full">
                  <div className="shadow-md rounded my-5">
                    <table className="min-w-max bg-white w-full table-auto">
                      <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center">Sr_No</th>
                          <th className="py-3 px-6 text-center">
                            Academic_Year
                          </th>
                          <th className="py-3 px-6 text-center">Item</th>
                          <th className="py-3 px-6 text-center">Description</th>
                          <th className="py-3 px-6 text-center">Quantity</th>
                          <th className="py-3 px-6 text-center">
                            Total_Quantity
                          </th>
                          <th className="py-3 px-6 text-center">Price</th>
                          <th className="py-3 px-6 text-center">Total</th>
                          <th className="py-3 px-6 text-center">Bill_No</th>
                          <th className="py-3 px-6 text-center">
                            Invoice_Date
                          </th>
                          <th className="py-3 px-6 text-center">PO_No</th>
                          <th className="py-3 px-6 text-center">PO_Date</th>
                          <th className="py-3 px-6 text-center">
                            Supplier_Name
                          </th>
                          <th className="py-3 px-6 text-center">Address</th>
                          <th className="py-3 px-6 text-center">Contact</th>
                          <th className="py-3 px-6 text-center">Department</th>
                        </tr>
                      </thead>
                      <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center">
                            <div className="checkbox-flex">
                              <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                onClick={handleDeleteMany}
                                disabled={selectedRows.length === 0}
                              >
                                Delete
                              </button>
                              <input
                                type="checkbox"
                                style={{ marginTop: "4px" }}
                                checked={selectedRows.length === files.length}
                                onChange={(e) =>
                                  setSelectedRows(
                                    e.target.checked
                                      ? files.map((file) => file._id)
                                      : []
                                  )
                                }
                              />
                            </div>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="sr_no"
                              placeholder="Enter sr_no"
                              value={sr_no}
                              onChange={(event) => {
                                setSr_No(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="academic_year"
                              placeholder="Enter Academic Year in yyyy-yy fromat"
                              value={academic_year}
                              onChange={(event) => {
                                setAcademicYear(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="item"
                              placeholder="Enter Item"
                              value={item}
                              onChange={(event) => {
                                setItem(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="description"
                              placeholder="Enter Description"
                              value={description}
                              onChange={(event) => {
                                setDescription(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="quantity"
                              placeholder="Enter Quantity"
                              value={quantity}
                              onChange={(event) => {
                                setQuantity(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="totalquantity"
                              placeholder="Enter Total Quantity"
                              value={totalquantity}
                              onChange={(event) => {
                                setTotalQuantity(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <div className="updown">
                              <input
                                className="form-box-sm"
                                type="text"
                                name="pricelesser"
                                placeholder="Enter Min Price"
                                value={pricelesser}
                                onChange={(event) => {
                                  setPricelesser(event.target.value);
                                }}
                              ></input>
                              <input
                                className="form-box-sm"
                                type="text"
                                name="pricegreater"
                                placeholder="Enter Max Price"
                                value={pricegreater}
                                onChange={(event) => {
                                  setPricegreater(event.target.value);
                                }}
                              ></input>
                            </div>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="total"
                              placeholder="Enter Total"
                              value={total}
                              onChange={(event) => {
                                setTotal(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="bill_no"
                              placeholder="Enter Bill no."
                              value={bill_no}
                              onChange={(event) => {
                                setBill_no(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="po_no"
                              placeholder="Enter PO No."
                              value={po_no}
                              onChange={(event) => {
                                setPO_no(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center">
                            <select
                              className="form-dropdown-sm"
                              value={supplier}
                              onChange={(event) => {
                                if (event.target.value === "Select supplier") {
                                  setSupplier("");
                                } else {
                                  setSupplier(event.target.value);
                                }
                              }}
                            >
                              <option>Select supplier</option>
                              {all.map((supp) => (
                                <option key={supp.supplier}>
                                  {supp.supplier}
                                </option>
                              ))}
                            </select>
                          </th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center"></th>
                        </tr>
                      </thead>
                      {loading ? (
                        <>
                          <tbody className="text-gray-600 text-sm font-light">
                            <tr className="border-b border-gray-200 hover:bg-gray-100">
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>

                              <td
                                className="py-3 px-6 text-center"
                                style={{ cursor: "pointer" }}
                              >
                                <div>
                                  <Oval
                                    height={40}
                                    width={40}
                                    color="#4fa94d"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                    visible={true}
                                    ariaLabel="oval-loading"
                                    secondaryColor="#4fa94d"
                                    strokeWidth={2}
                                    strokeWidthSecondary={2}
                                  />
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </>
                      ) : (
                        <>
                          {files.map((file) => (
                            <>
                              <tbody className="text-gray-600 text-sm font-light">
                                <tr className="border-b border-gray-200 hover:bg-gray-100">
                                  <td
                                    className="py-3 px-6 text-center"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div
                                      className="transform hover:text-green-500 hover:scale-110"
                                      onClick={() => openPopup(file)}
                                    >
                                      <RiEdit2Line className="table-icons"></RiEdit2Line>
                                    </div>
                                  </td>

                                  <td
                                    className="py-3 px-6 text-center"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div
                                      className="transform hover:text-red-500 hover:scale-110"
                                      onClick={() =>
                                        handleDeleteClick(file._id, true)
                                      }
                                    >
                                      <RiDeleteBin6Line className="table-icons"></RiDeleteBin6Line>
                                    </div>

                                    {confirmDelete &&
                                    confirmDeleteId === file._id ? (
                                      <>
                                        <td
                                          className="py-3 px-6 text-center"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <div className="flex-row">
                                            <div
                                              onClick={() =>
                                                handleDelete(file._id)
                                              }
                                            >
                                              <div
                                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                                style={{ marginRight: "10px" }}
                                              >
                                                Delete
                                              </div>
                                            </div>
                                            <div
                                              onClick={() =>
                                                setConfirmDelete(false)
                                              }
                                            >
                                              <div className="bg-neutral-500 text-white px-4 py-2 rounded-md hover:bg-neutral-600">
                                                Cancel
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>
                                      <input
                                        type="checkbox"
                                        checked={selectedRows.includes(
                                          file._id
                                        )}
                                        onChange={(e) =>
                                          setSelectedRows(
                                            (prevSelectedRows) => {
                                              if (e.target.checked) {
                                                return [
                                                  ...prevSelectedRows,
                                                  file._id,
                                                ];
                                              } else {
                                                return prevSelectedRows.filter(
                                                  (id) => id !== file._id
                                                );
                                              }
                                            }
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Sr_No}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Academic_Year}</div>
                                  </td>
                                  <td
                                    className="py-3 px-6 text-center"
                                    style={{
                                      wordBreak: "break-all",
                                      overflowWrap: "break-word",
                                      maxWidth: "300px",
                                    }}
                                  >
                                    <div>{file.Item}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Description}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Quantity}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Total_Quantity}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Price}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Total}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Bill_No}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Invoice_Date}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.PO_No}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.PO_Date}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Supplier_Name}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Address}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Contact}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Department}</div>
                                  </td>
                                </tr>
                              </tbody>
                            </>
                          ))}
                        </>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="download-flex">
              <div>
                <form
                  onSubmit={(event) => {
                    handleSubmit(event);
                  }}
                >
                  <button
                    type="submit"
                    className="btn download-btn"
                    role="button"
                  >
                    Download purchase file
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PcViewPurchase;
