import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import HeaderPc from "../components/HeaderPc";
import PcSidebarRepair from "../components/PcSidebarRepair";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { RiEdit2Line } from "react-icons/ri";
import { Oval } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";

const PcViewRepair = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [files, setFiles] = useState([]);
  const [department, setDepartment] = useState("");
  const [sr_no, setSr_No] = useState("");
  const [bill_no, setBill_no] = useState("");
  const [academic_year, setAcademicYear] = useState("");
  const [supplier, setSupplier] = useState("");
  const [all, setAll] = useState([]);
  const [description, setDescription] = useState([]);
  const [amountlesser, setAmountlesser] = useState("");
  const [amountgreater, setAmountgreater] = useState("");
  const [material, setMaterial] = useState("");
  const [recyear, setRecyear] = useState("");
  const [expenselesser, setExpenselesser] = useState("");
  const [expensegreater, setExpensegreater] = useState("");
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
    formData.Description_of_Material = file.Description_of_Material;
    formData.Supplier_Name = supplierName;
    formData.Bill_No = file.Bill_No;
    formData.Date = file.Date;
    formData.Amount = file.Amount;
    formData.Material = file.Material;
    formData.Receiving_date = file.Receiving_date;
    formData.Year = file.Year;
    formData.Yearly_expense = file.Yearly_expense;
    formData.Department = file.Department;
    setPop(!popup);
  };
  const closePopup = () => {
    setPop(false);
  };
  const [formData, setFormData] = useState({
    _id: "",
    Sr_No: "",
    Description_of_Material: "",
    Name_Of_Supplier: "",
    Bill_No: "",
    Date: "",
    Amount: "",
    Material: "",
    Receiving_date: "",
    Year: "",
    Yearly_expense: "",
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
        `${process.env.BASE_URL}/pc/updaterepair`,
        {
          _id: formData._id,
          Sr_No: formData.Sr_No,
          Description_of_Material: formData.Description_of_Material,
          Name_Of_Supplier: supplierName,
          Bill_No: formData.Bill_No,
          Date: formData.Date,
          Amount: formData.Amount,
          Material: formData.Material,
          Receiving_date: formData.Receiving_date,
          Year: formData.Year,
          Yearly_expense: formData.Yearly_expense,
          // Address: supplierAddress,
          // Contact: supplierContact,
          Department: department,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.message === "Data inserted in recurring database") {
          toast.success("Detail update successfully");
        } else if (response.data.message === "Internal server error") {
          toast.error("Internal server error");
        } else {
          toast.error("Error");
        }
      })
      .then((res) => {
        window.location.reload("user/pc/repair/view");
      })
      .catch((err) => {
        window.location.reload("user/pc/repair/view");
        console.log("Error is " + err);
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.get(
      `${process.env.BASE_URL}/pc/downloadrepairfile`,
      {
        responseType: "blob",
        params: {
          department: department,
          sr_no: sr_no,
          academic_year: academic_year,
          bill_no: bill_no,
          supplier: supplier,
          description: description,
          material: material,
          recyear: recyear,
          amountgreater: amountgreater,
          amountlesser: amountlesser,
          expensegreater: expensegreater,
          expenselesser: expenselesser,
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
    setConfirmDelete(false);
    try {
      await axios
        .post(`${process.env.BASE_URL}/pc/deleterowrepair`, {
          id: id,
        })
        .then((res) => {
          window.location.reload("user/pc/repair/view");
        })
        .catch((err) => {
          window.location.reload("user/pc/repair/view");
        });
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteMany = async () => {
    try {
      await axios
        .post(`${process.env.BASE_URL}/pc/deleterowrepairmany`, {
          ids: selectedRows,
        })
        .then((res) => {
          window.location.reload("user/pc/repair/view");
        })
        .catch((err) => {
          window.location.reload("user/pc/repair/view");
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${process.env.BASE_URL}/pc/getsupp`, {
        withCredentials: true,
      })
      .then((response) => {
        setAll(response.data.supp);
        return axios.get(`${process.env.BASE_URL}/pc/getme`, {
          withCredentials: true,
        });
      })
      .then((response) => {
        setDepartment(response.data.department);
        return axios.get(`${process.env.BASE_URL}/pc/searchrepair`, {
          withCredentials: true,
          params: {
            department: response.data.department,
            sr_no: sr_no,
            academic_year: academic_year,
            bill_no: bill_no,
            supplier: supplier,
            description: description,
            material: material,
            recyear: recyear,
            amountgreater: amountgreater,
            amountlesser: amountlesser,
            expensegreater: expensegreater,
            expenselesser: expenselesser,
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
    bill_no,
    supplier,
    description,
    material,
    recyear,
    amountgreater,
    amountlesser,
    expensegreater,
    expenselesser,
  ]);

  return (
    <>
      <div>
        <HeaderPc />
        <PcSidebarRepair />
        <ToastContainer />
        <div className="title-size text-color">Recurring data</div>
        {popup ? (
          <>
            <div className="main-popup">
              <div className="popup">
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
                      <p className="form-text">Enter details of recurring</p>
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
                          <p className="form-text2">Description</p>
                          <input
                            className="pc-form-box"
                            type="text"
                            placeholder="Enter Description of Material"
                            name="Description_of_Material"
                            value={formData.Description_of_Material}
                            onChange={handleInputChange}
                          ></input>
                        </div>

                        <div className="flex-form">
                          <p className="form-text2">Supplier</p>
                          <select
                            className="form-dropdown"
                            value={supplierName}
                            onChange={(event) => {
                              if (event.target.value === "Select supplier") {
                                setSupplierName("");
                                // setSupplierAddress("");
                                // setSupplierContact("");
                              } else {
                                const selectedSupplier = event.target.value;
                                // const selectedSupplierObject = all.find(
                                //   (supp) => supp.supplier === selectedSupplier
                                // );
                                setSupplierName(selectedSupplier);
                                // setSupplierAddress(
                                //   selectedSupplierObject.address
                                // );
                                // setSupplierContact(
                                //   selectedSupplierObject.contact
                                // );
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
                          <p className="form-text2">Date</p>
                          <input
                            className="pc-form-box"
                            type="text"
                            placeholder="Enter Date in dd/mm/yyyy fromat"
                            name="Date"
                            value={formData.Date}
                            onChange={handleInputChange}
                          ></input>
                        </div>

                        <div className="flex-form">
                          <p className="form-text2">Amount</p>
                          <input
                            className="pc-form-box"
                            type="text"
                            placeholder="Enter Amount"
                            name="Amount"
                            value={formData.Amount}
                            onChange={handleInputChange}
                          ></input>
                        </div>

                        <div className="flex-form">
                          <p className="form-text2">Material</p>
                          <input
                            className="pc-form-box"
                            type="text"
                            placeholder="Enter Material"
                            name="Material"
                            value={formData.Material}
                            onChange={handleInputChange}
                          ></input>
                        </div>

                        <div className="flex-form">
                          <p className="form-text2">Receiving Date</p>
                          <input
                            className="pc-form-box"
                            type="text"
                            placeholder="Enter Receiving Date in dd/mm/yyyy format"
                            name="Receiving_date"
                            value={formData.Receiving_date}
                            onChange={handleInputChange}
                          ></input>
                        </div>

                        <div className="flex-form">
                          <p className="form-text2">Year</p>
                          <input
                            className="pc-form-box"
                            type="text"
                            placeholder="Enter Year"
                            name="Year"
                            value={formData.Year}
                            onChange={handleInputChange}
                          ></input>
                        </div>

                        <div className="flex-form">
                          <p className="form-text2">Expense</p>
                          <input
                            className="pc-form-box"
                            type="text"
                            placeholder="Enter Yearly expense"
                            name="Yearly_expense"
                            value={formData.Yearly_expense}
                            onChange={handleInputChange}
                          ></input>
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
                            Description_of_Material
                          </th>
                          <th className="py-3 px-6 text-center">
                            Name_Of_Supplier
                          </th>
                          <th className="py-3 px-6 text-center">Bill_No</th>
                          <th className="py-3 px-6 text-center">Date</th>
                          <th className="py-3 px-6 text-center">Amount</th>
                          <th className="py-3 px-6 text-center">Material</th>
                          <th className="py-3 px-6 text-center">
                            Receiving_date
                          </th>
                          <th className="py-3 px-6 text-center">Year</th>
                          <th className="py-3 px-6 text-center">
                            Yearly_expense
                          </th>
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
                              name="description"
                              placeholder="Enter Description"
                              value={description}
                              onChange={(event) => {
                                setDescription(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <select
                              className="form-dropdown-sm"
                              value={supplier}
                              onChange={(event) => {
                                // console.log(event.target.value);
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
                          <th className="py-3 px-6 text-center">Date</th>
                          <th className="py-3 px-6 text-center">
                            <div className="updown">
                              <input
                                className="form-box-sm"
                                type="text"
                                name="amountlesser"
                                placeholder="Enter Min Amount"
                                value={amountlesser}
                                onChange={(event) => {
                                  setAmountlesser(event.target.value);
                                }}
                              ></input>
                              <input
                                className="form-box-sm"
                                type="text"
                                name="amountgreater"
                                placeholder="EnterMax Amount"
                                value={amountgreater}
                                onChange={(event) => {
                                  setAmountgreater(event.target.value);
                                }}
                              ></input>
                            </div>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="material"
                              placeholder="Enter Material"
                              value={material}
                              onChange={(event) => {
                                setMaterial(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center"></th>
                          <th className="py-3 px-6 text-center">
                            <input
                              className="form-box-sm"
                              type="text"
                              name="academic_year"
                              placeholder="Enter Year (yyyy-yy)"
                              value={academic_year}
                              onChange={(event) => {
                                setAcademicYear(event.target.value);
                              }}
                            ></input>
                          </th>
                          <th className="py-3 px-6 text-center">
                            <div className="updown">
                              <input
                                className="form-box-sm"
                                type="text"
                                name="expenselesser"
                                placeholder="Enter Min Yearly Expense"
                                value={expenselesser}
                                onChange={(event) => {
                                  setExpenselesser(event.target.value);
                                }}
                              ></input>
                              <input
                                className="form-box-sm"
                                type="text"
                                name="expensegreater"
                                placeholder="Enter Max Yearly Expense"
                                value={expensegreater}
                                onChange={(event) => {
                                  setExpensegreater(event.target.value);
                                }}
                              ></input>
                            </div>
                          </th>
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
                                  <td
                                    className="py-3 px-6 text-center"
                                    style={{
                                      wordBreak: "break-all",
                                      overflowWrap: "break-word",
                                      maxWidth: "300px",
                                    }}
                                  >
                                    <div>{file.Description_of_Material}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Name_Of_Supplier}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Bill_No}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Date}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Amount}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Material}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Receiving_date}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Year}</div>
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div>{file.Yearly_expense}</div>
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
                    Download repair file
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

export default PcViewRepair;
