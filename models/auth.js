const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userAuthSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["student", "tpo"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profile: {
    type: Schema.Types.ObjectId,
    required: false,
    refPath: "userType",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a pre-find middleware to handle population
userAuthSchema.pre("find", function (next) {
  if (this.options.populate && this.options.populate.path === "profile") {
    const userType = this._conditions.userType;
    this.populate({
      path: "profile",
      model: userType === "student" ? "Student" : "TPO",
    });
  }
  next();
});

module.exports = mongoose.model("UserAuth", userAuthSchema);
