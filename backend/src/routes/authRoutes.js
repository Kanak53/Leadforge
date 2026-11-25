import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";

const router = Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

router.post("/login", [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required")
], validate, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

export default router;
