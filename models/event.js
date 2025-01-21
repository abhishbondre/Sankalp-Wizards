const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  description: String,
  date: Date,
  venue: String,
  collegeName: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "UserAuth",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

eventSchema.index({ collegeName: 1, date: 1 });

module.exports = mongoose.model("Event", eventSchema);
