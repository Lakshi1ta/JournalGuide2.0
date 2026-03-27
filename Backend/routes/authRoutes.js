import express from "express";
import { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile,
  getUserQuestions,
  updateUserQuestions,
  addCustomQuestion,
  removeCustomQuestion,
  resetToDefaultQuestions,
  updateMindset,
  getMindset
} from "../controller/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);

// Mindset routes
router.get("/mindset", protect, getMindset);
router.put("/mindset", protect, updateMindset);

// Question management routes
router.get("/questions", protect, getUserQuestions);
router.put("/questions", protect, updateUserQuestions);
router.post("/questions", protect, addCustomQuestion);
router.delete("/questions/:id", protect, removeCustomQuestion);
router.post("/questions/reset", protect, resetToDefaultQuestions);

export default router;