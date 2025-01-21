const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
  },
  collegeId: {
    type: String,
    // Remove unique: true if collegeId can be shared
    // Or make it unique within a college using compound index
  },
  collegeName: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
  },
  profile: {
    phone: String,
    address: String,
    skills: [String],
    resume: String,
    socialLinks: [
      {
        platform: String,
        url: String,
      },
    ],
    certificates: [
      {
        name: String,
        issueDate: Date,
        url: String,
      },
    ],
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  socialLinks: [
    {
      platform: {
        type: String,
        required: true,
        enum: ["LinkedIn", "GitHub", "Portfolio", "Twitter"],
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
});

// If you want collegeId to be unique within a college, use compound index
studentSchema.index({ collegeId: 1, collegeName: 1 }, { unique: true });

// Remove the single field index if it exists
studentSchema.index({ collegeId: 1 }, { unique: false }) ||
  studentSchema.indexes().splice(
    studentSchema
      .indexes()
      .findIndex(
        ([fields]) => Object.keys(fields).length === 1 && fields.collegeId
      ),
    1
  );

module.exports = mongoose.model("Student", studentSchema);
