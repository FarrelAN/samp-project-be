import express from "express";
import {
  getAllCases,
  createCase,
  updateCaseStatus,
  getCase,
  getCaseStatusCounts,
  getAdminData,
} from "../controllers/caseController.js";

const router = express.Router();

router.route("/").get(getAllCases).post(createCase);
router.route("/count").get(getCaseStatusCounts);
router.route("/admin").get(getAdminData);
router.route("/:id").patch(updateCaseStatus).get(getCase);

export default router;
