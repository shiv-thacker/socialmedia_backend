const express = require("express");
const port = 8000;

const app = express();

require("./db");
require("./models/User");

const authRoutes = require("./routes/authRoutes");
const uploadMediaroutes = require("./routes/uploadMediaRoutes");
const bodyParser = require("body-parser");
//requiretoken skipped

app.use(bodyParser.json());
app.use(authRoutes);
app.use(uploadMediaroutes);
app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log("server is running on port" + port);
});
