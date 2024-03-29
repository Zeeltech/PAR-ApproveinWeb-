import axios from "axios";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import HeaderHod from "../components/HeaderHod";
import HodSidebarRepair from "../components/HodSidebarRepair";

const HodDownloadRepair = () => {
  const [department, setDepartment] = useState("");

  useEffect(() => {
    axios
      .get(`https://${process.env.REACT_APP_BASE_URL}/hod/getme`, {
        withCredentials: true,
      })
      .then((response) => {
        setDepartment(response.data.department);
      });
  });
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.get(
      `https://${process.env.REACT_APP_BASE_URL}/hod/downloadrepairfile`,
      {
        responseType: "blob",
        params: {
          department: department,
        },
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `https://${Date.now()}` + "test.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <HeaderHod />
      <HodSidebarRepair />
      <div className="download-flex">
        <div>
          <p className="text-color text-size">Download purchase file</p>
        </div>
        <div>
          <form
            onSubmit={(event) => {
              handleSubmit(event);
            }}
          >
            <button type="submit" className="btn download-btn" role="button">
              Download Recurring File
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default HodDownloadRepair;
