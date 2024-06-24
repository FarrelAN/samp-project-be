import mongoose from "mongoose";

const caseSchema = mongoose.Schema({
  case_status: {
    type: String,
    enum: ["OPEN", "ON PROGRESS", "CLOSED", "REVIEW"],
    default: "Open",
  },
  case_score: {
    type: String,
  },
  model_name: {
    type: String,
  },
  case_severity: {
    type: String,
  },
  impact_scope: {
    type: String,
  },
  data_source: {
    type: String,
  },
  created_at: {
    type: String,
    default: Date().now,
  },
  resolution: {
    type: String,
  },
  PIC: {
    PIC_IAM: {
      type: String,
    },
    PIC_SOC: {
      type: String,
    },
  },
  associated_insight: {
    type: String,
  },
  highlight_information: {
    type: String,
  },
  technique: {
    type: String,
  },
  rules: {
    type: String,
  },
  ip_address: {
    type: String,
  },
  mac_address: {
    type: String,
  },
  timestamps: {
    open: {
      type: Date,
    },
    in_progress: {
      type: Date,
    },
    awaiting_review: {
      type: Date,
    },
    closed: {
      type: Date,
    },
  },
  no_waprib: {
    type: Number,
  },
  job_level: {
    type: String,
  },
  region: {
    type: String,
  },
});

export default mongoose.model("Case", caseSchema);
