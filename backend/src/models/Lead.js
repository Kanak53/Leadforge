import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true, maxlength: 100 },
  source: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["New", "Contacted", "Interested", "Converted", "Lost"],
    default: "New"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Lead", leadSchema);
