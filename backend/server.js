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
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use("/", (req, res) => {
  res.json("Hello");
});
/* app.use("/admin", adminroute);
app.use("/dean", deanroute);
app.use("/hod", hodroute);
app.use("/pc", pcroute); */

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on ${port}`));
