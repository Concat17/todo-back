import "./lib/db";
import express from "express";
import taskRoutes from "./routes/task";

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

app.use("/todo", taskRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
