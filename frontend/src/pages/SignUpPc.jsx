import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import login from "../Asset/Login.png";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";

function SignUpPc() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [department, setDepartment] = useState("");
  const [all, setAll] = useState([]);

  const navigate = useNavigate();

  /*  useEffect(() => {
    axios
      .get(`https://${process.env.REACT_APP_BASE_URL}/pc/dashboard", { withCredentials: true })
      .then((response) => navigate("/pc/dashboard"));
  }); */

  useEffect(() => {
    axios
      .get(`https://${process.env.REACT_APP_BASE_URL}/pc/getdept`)
      .then((response) => setAll(response.data.depts));
  });

  const handleSingup = async (event) => {
    event.preventDefault();
    if (
      email === "" ||
      password === "" ||
      username === "" ||
      confirmpassword === "" ||
      department === ""
    ) {
      toast.error("All fields are required");
    } else if (password !== confirmpassword) {
      toast.error("Password does not match");
    } else {
      // make a POST request to the login route on the back-end server

      await axios
        .post(`https://${process.env.REACT_APP_BASE_URL}/pc/signup`, {
          email: email,
          password: password,
          name: username,
          department: department,
        })
        // if the login is successful, redirect to the dashboard
        // if(response.data){console.log(response.data)
        //   localStorage.setItem("user", response.data);
        //   localStorage.setItem("isLoggedIn", true);
        //   setSessionExpiration(Date.now() + 3600000);
        //   window.location.href = "http://localhost:3000/user/dashboard";
        // }
        .then((response) => {
          if (response.data.message === "User Already Exists") {
            toast.error("User Already Exists");
          } else {
            toast.success("Signup request is sent to admin");
            /*             navigate("/request", { state: { user: response.data.email } }); */
          }
        });
    }
  };
  return (
    <div>
      <Header />
      <ToastContainer />
      <div className="main">
        <div className="main-left">
          <div className="innner-left">
            <p id="form-text">Sign up as Purchase Coordinator</p>
            <form action="" className="box-grp">
              <input
                className="form-box"
                type="text"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              ></input>
              <input
                className="form-box"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                }}
              ></input>
              <input
                className="form-box"
                type="password"
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              ></input>
              <input
                className="form-box"
                type="password"
                name="confirmpassword"
                placeholder="Re-enter password"
                value={confirmpassword}
                onChange={(event) => {
                  setConfirmpassword(event.target.value);
                }}
              ></input>

              <select
                className="dropdown"
                value={department}
                onChange={(event) => {
                  if (event.target.value === "Select Department") {
                    setDepartment("");
                  } else {
                    setDepartment(event.target.value);
                  }
                }}
              >
                <option>Select Department</option>
                {all.map((dept) => (
                  <option>{dept.department}</option>
                ))}
              </select>

              <button
                type="submit"
                className="form-box"
                id="submit-btn"
                onClick={handleSingup}
              >
                Create new account
              </button>
            </form>
          </div>
        </div>
        <div className="main-right">
          <img src={login} className="login-img" srcSet="" alt="login" />
        </div>
      </div>
    </div>
  );
}

export default SignUpPc;
