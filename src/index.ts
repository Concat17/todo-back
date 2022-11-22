import "./lib/db";
import express from "express";
import todoRoutes from "./routes/todo";
import fileRoutes from "./routes/file";

const app = express();
const port = process.env.PORT || 3333;
const cors = require("cors");

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));
app.use(cors());

app.get("/", async (req, res) => {
  res.json({ message: "test" });
});

app.use("/todo", todoRoutes);
app.use("/file", fileRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
