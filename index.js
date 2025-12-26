import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Node 22 App is running on Azure 🚀</h1>");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

