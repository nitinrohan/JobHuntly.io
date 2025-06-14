const express = require("express");
const multer = require("multer");
const Job = require("/Users/rohanb/job_application_tracker/server/models/job.js");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ _id: 1 }); // Oldest to newest by creation
    res.json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    res.status(500).json({ message: "Failed to fetch jobs." });
  }
});

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { email, role, company, jobLink, status, notes, dateAdded } =
      req.body;

    const job = new Job({
      email,
      role,
      company,
      jobLink,
      status,
      notes,
      dateAdded: dateAdded ? new Date(dateAdded) : new Date(),
      resumeFileName: req.file?.filename || null,
    });

    console.log("📥 POST /api/jobs hit");
    console.log("🧾 Body:", req.body);
    console.log("📎 Resume:", req.file);

    await job.save();
    res.status(201).json({ message: "Job added successfully!" });
  } catch (err) {
    console.error("❌ Error saving job:", err);
    res.status(500).json({ message: "Failed to save job." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error("❌ Error deleting job:", err);
    res.status(500).json({ message: "Failed to delete job." });
  }
});

module.exports = router;
