import axios from "axios";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import logo from "../Asset/fileupload.png";
import "react-toastify/dist/ReactToastify.css";
import HeaderPc from "../components/HeaderPc";
import PcSidebarRepair from "../components/PcSidebarRepair";
import { Link } from "react-router-dom";
const PcUploadRepair = () => {
  const [file, setFile] = useState();
  const [department, setDepartment] = useState("");

  useEffect(() => {
    axios
      .get(`https://${process.env.BASE_URL}/pc/getme`, {
        withCredentials: true,
      })
      .then((response) => {
        setDepartment(response.data.department);
        console.log("setting" + response.data.department);
      });
  });

  const handleChange = (event) => {
    // console.log(event.target);
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // console.log(file);
    const formData = new FormData();
    formData.append("uploads", file);
    // console.log(formData);

    axios
      .post(`https://${process.env.BASE_URL}/pc/uploadrepairfile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { department: department },
      })
      .then((response) => {
        console.log(response);
        if (response.data.message === "Duplicate key found") {
          toast.error(response.data.pe);
        }
        if (response.data.message === "Please reload the page") {
          toast.error("Please reload the page");
        } else {
          var print = "";
          console.log(response.data.ps.length);
          for (var i = 0; i < response.data.ps.length; i++) {
            print = print + response.data.ps[i];
            if (i !== response.data.ps.length - 1) {
              print = print + " , ";
            }
          }
          if (response.data.ps.length !== 0) {
            toast.success("Successfully uploaded data with Sr no. " + print);
          }
        }
      })
      .catch(() => {});
  };

  return (
    <>
      <HeaderPc />
      <PcSidebarRepair />
      <div className="outer-container">
        <div className="my-6">
          <p className="text-color title-size">Upload recurring files </p>
        </div>
        <div className="mycontainer1">
          <div>
            <p className="format">Download format for recurring file </p>
          </div>
          <Link
            to="https://docs.google.com/spreadsheets/d/17AKdKZAsQ6Urbto2RvoN_MhcWQMH4QI2/edit?usp=sharing&ouid=102308490812095146273&rtpof=true&sd=true"
            target="_blank"
          >
            <div className="btn" role="button">
              Download sample file
            </div>
          </Link>
        </div>
        <div className="mycontainer">
          <div className="upload-container">
            <form
              onSubmit={(event) => {
                handleSubmit(event);
              }}
            >
              <div className="upload-dot">
                <img src={logo} className="img-file" />
                <h3>Browse .XLSX Files</h3>
                <input
                  className="file-in"
                  type="file"
                  accept=".xls, .xlsx"
                  name="uploads"
                  onChange={(event) => {
                    handleChange(event);
                  }}
                />
              </div>
              <button type="submit" className="btn upload-btn" role="button">
                Upload
              </button>
            </form>
            <ToastContainer />
          </div>
        </div>
      </div>
    </>
  );
};

export default PcUploadRepair;
