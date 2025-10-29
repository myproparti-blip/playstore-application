import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPropertyDealer: { type: String, enum: ["yes", "no"], required: true },
    agentName: { type: String, required: true },
    firmName: { type: String },
    operatingCity: { type: String, required: true },
    operatingAreaChips: [{ type: String }],
    operatingSince: { type: String },
    teamMembers: { type: String },
    dealsIn: [{ type: String }],
    dealsInOther: { type: String },
    aboutAgent: { type: String },
  },
  { timestamps: true }
);

const Agent = mongoose.model("Agent", agentSchema);

export default Agent;
