const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tpoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
  },
  collegeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  collegeName: String,
  phone: String,
  profile: {
    designation: String,
    department: String,
    officeLocation: String,
    officeHours: String,
    alternateContact: String,
    photo: String,
  },
  collegeDetails: {
    address: String,
    website: String,
    accreditation: String,
    establishedYear: Number,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("TPO", tpoSchema);
