const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const opportunitySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

opportunitySchema.index({ collegeName: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);
