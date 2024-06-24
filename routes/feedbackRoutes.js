import { Router } from "express";
import {
  getAllFeedbacks,
  getFeedback,
  analyzeFeedbacks,
} from "../controllers/feedbackController.js";

const router = Router();

router.get("/", getAllFeedbacks);
router.get("/:id", getFeedback);
router.post("/analyze", analyzeFeedbacks); // Ensure this is a POST route

export default router;
