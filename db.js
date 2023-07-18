const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.mongo_URL)
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log("error in database connection" + err);
  });
