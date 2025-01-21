const mongoose = require("mongoose");
const Student = require("./student");
const TPO = require("./tpo");
const UserAuth = require("./auth");
const Opportunity = require("./opportunity");
const Event = require("./event");

// Ensure models are registered
const models = {
  Student: mongoose.model("Student", Student.schema),
  TPO: mongoose.model("TPO", TPO.schema),
  UserAuth: mongoose.model("UserAuth", UserAuth.schema),
  Opportunity: mongoose.model("Opportunity", Opportunity.schema),
  Event: mongoose.model("Event", Event.schema),
};

module.exports = models;
