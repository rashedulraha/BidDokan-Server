const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

//  middle ware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("server is running port number :", port);
});
