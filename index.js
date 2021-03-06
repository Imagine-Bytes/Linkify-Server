const express = require("express");
const app = express();
const mongoose = require("mongoose");
const config = require("./config/config");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;

//Configuring Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


const connectionString = config.URI;

//Configure MongoDB Database
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((response) => {
    console.log("MongoDB Database Running Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Database not Available ");
  });

app.use(express.static(path.join(__dirname, "public")));



const allRoutes = require("./routes/all");
app.use("/", allRoutes);


//Listen
app.listen(PORT, () => {
  console.log("Server is running...");
});
