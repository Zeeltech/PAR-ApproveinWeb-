const express = require("express");
const dotenv = require("dotenv").config();
const deanroute = require("./api/deanroute");
const hodroute = require("./api/hodroute");
const pcroute = require("./api/pcroute");
const adminroute = require("./api/adminroute");
const { errorHandler } = require("./middleware/errorMiddleware");
const colors = require("colors");
const port = process.env.PORT || 8000;
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

connectDB();

const app = express();

const corsOptions = {
  origin: "https://purchase-and-repair-f.onrender.com",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
/* app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://purchase-and-repair-f.onrender.com"
  );
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  next();
}); */
app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use("/admin", adminroute);
app.use("/dean", deanroute);
app.use("/hod", hodroute);
app.use("/pc", pcroute);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
  console.log(`https://${process.env.BASE_URL}/dean/signup`);
});
