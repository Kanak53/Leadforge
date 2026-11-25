import { Router } from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

const statuses = ["New", "Contacted", "Interested", "Converted", "Lost"];
const validateLead = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("phone").trim().matches(/^[+]?[\d\s()-]{7,20}$/).withMessage("Enter a valid phone number"),
  body("company").trim().notEmpty().withMessage("Company name is required"),
  body("source").trim().notEmpty().withMessage("Lead source is required"),
  body("status").optional().isIn(statuses).withMessage("Invalid lead status")
];
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.get("/", async (req, res, next) => {
  try {
    const { search = "", status = "" } = req.query;
    const filter = { createdBy: req.userId };
    if (status && statuses.includes(status)) filter.status = status;
    if (search) {
      filter.$or = ["fullName", "email", "company", "phone"].map(field => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) { next(error); }
});

router.get("/stats", async (req, res, next) => {
  try {
    const leads = await Lead.find({ createdBy: req.userId }).select("status");
    res.json({
      total: leads.length,
      new: leads.filter(x => x.status === "New").length,
      contacted: leads.filter(x => x.status === "Contacted").length,
      converted: leads.filter(x => x.status === "Converted").length
    });
  } catch (error) { next(error); }
});

router.post("/", validateLead, checkValidation, async (req, res, next) => {
  try {
    const lead = await Lead.create({ ...req.body, createdBy: req.userId });
    res.status(201).json(lead);
  } catch (error) { next(error); }
});

router.put("/:id", validateLead, checkValidation, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid lead ID" });
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body, { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid lead ID" });
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted successfully" });
  } catch (error) { next(error); }
});

export default router;
