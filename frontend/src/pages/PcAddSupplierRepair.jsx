import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TiDelete } from "react-icons/ti";
import HeaderPc from "../components/HeaderPc";
import PcSidebarRepair from "../components/PcSidebarRepair";

function PcAddSupplierRepair() {
  const [value, setValue] = useState(""); //supplier name
  const [suppAdd, setSuppAdd] = useState("");
  const [suppContact, setSuppContact] = useState("");
  const [all, setAll] = useState([]); //get all supplier name,address,contact

  useEffect(() => {
    axios
      .get(`https://${process.env.REACT_APP_BASE_URL}/pc/getsupp`, { withCredentials: true })
      .then((response) => setAll(response.data.supp));
  });

  const handleSupp = async (event) => {
    event.preventDefault();
    await axios
      .post(
        `https://${process.env.REACT_APP_BASE_URL}/pc/addsupp`,
        {
          supplier: value,
          address: suppAdd,
          contact: suppContact,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.message === "Duplicate") {
          toast.error("Supplier already exist");
        }
      })
      .catch((error) => {
        console.log("Error is " + error);
      });
  };

  const suppDelete = async (event, supplier) => {
    event.preventDefault();
    await axios
      .post(`https://${process.env.REACT_APP_BASE_URL}/pc/deletesupp`, {
        supplier: supplier,
      })
      .then((res) => {
        window.location.reload("user/pc/dashboard");
      })
      .catch((err) => {
        window.location.reload("user/pc/dashboard");
      });
  };
  return (
    <>
      <HeaderPc />
      <ToastContainer />
      <PcSidebarRepair />
      <div className="main">
        <div className="main-left">
          <div className="innner-left">
            <p id="form-text">Add Supplier </p>
            <form action="" className="box-grp">
              <input
                className="form-box"
                type="text"
                name="suppName"
                placeholder="Enter new supplier"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                }}
              ></input>
              <input
                className="form-box"
                type="text"
                name="suppAddress"
                placeholder="Enter supplier address"
                value={suppAdd}
                onChange={(event) => {
                  setSuppAdd(event.target.value);
                }}
              ></input>
              <input
                className="form-box"
                type="text"
                name="suppContact"
                placeholder="Enter supplier contact number"
                value={suppContact}
                onChange={(event) => {
                  setSuppContact(event.target.value);
                }}
              ></input>

              <button
                type="submit"
                className="form-box"
                id="submit-btn"
                onClick={handleSupp}
              >
                Add Supplier
              </button>
            </form>
          </div>
        </div>
        <div className="main-right">
          <div className="container table">
            <div className="overflow-x-auto">
              <div>
                <div className="w-full">
                  <div className="shadow-md rounded my-5">
                    <table className="min-w-max bg-white w-full table-auto">
                      <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-center">
                            Supplier Name
                          </th>
                          <th className="py-3 px-6 text-center">Address</th>
                          <th className="py-3 px-6 text-center">Contact</th>
                          <th className="py-3 px-6 text-center"></th>
                        </tr>
                      </thead>
                      {all.map((supp) => (
                        <>
                          {/* <div className="flex-row"> */}
                          <tr>
                            <td className="tdss">{supp.supplier}</td>
                            <td className="tdss">{supp.address}</td>
                            <td className="tdss">{supp.contact}</td>
                            <td>
                              <TiDelete
                                className="icon"
                                size={20}
                                onClick={(event) =>
                                  suppDelete(event, supp.supplier)
                                }
                              />
                            </td>
                          </tr>
                        </>
                      ))}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PcAddSupplierRepair;
