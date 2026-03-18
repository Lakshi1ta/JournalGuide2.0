import express from "express";
import { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile 
} from "../controller/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);  // Make sure this is here

export default router;