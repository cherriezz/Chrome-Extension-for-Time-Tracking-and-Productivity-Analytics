const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/timeTrackerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TimeLog = mongoose.model("TimeLog", new mongoose.Schema({
  domain: String,
  timeSpent: Number,
  date: { type: Date, default: Date.now },
}));

app.post("/logTime", async (req, res) => {
  const { domain, timeSpent } = req.body;
  await TimeLog.updateOne(
    { domain, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
    { $inc: { timeSpent } },
    { upsert: true }
  );
  res.send({ success: true });
});

app.get("/analytics", async (req, res) => {
  const data = await TimeLog.aggregate([
    { $group: { _id: "$domain", totalTime: { $sum: "$timeSpent" } } },
    { $sort: { totalTime: -1 } }
  ]);
  res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));
