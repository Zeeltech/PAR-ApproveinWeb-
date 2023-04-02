import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import HeaderDean from "../components/HeaderDean";
import DeanSidebarRepair from "../components/DeanSidebarRepair";

const DeanViewRepair = () => {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.get(
      "http://localhost:5000/pc/downloadrepairfile",
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

  useEffect(() => {
    setLoading(true);

    axios
      .get("http://localhost:5000/dean/getsupp", {
        withCredentials: true,
      })
      .then((response) => {
        setAll(response.data.supp);
        return axios.get("http://localhost:5000/dean/getme", {
          withCredentials: true,
        });
      })
      .then((response) => {
        setDepartment(response.data.department);
        return axios.get(`http://localhost:5000/dean/searchrepair`, {
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
        <HeaderDean />
        <DeanSidebarRepair />
        <div className="title-size text-color">Recurring data</div>
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
                            Receiving_Year
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
                      {files.map((file) => (
                        <>
                          <tbody className="text-gray-600 text-sm font-light">
                            <tr className="border-b border-gray-200 hover:bg-gray-100">
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
                                <div>{file.Receiving_Year}</div>
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
                    Download Recurring file
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

export default DeanViewRepair;
