const mongoose = require("mongoose");

const DiscordRoleSchema = new mongoose.Schema({
  platinum: { type: String, default: "" },
  gold1: { type: String, default: "" },
  gold2: { type: String, default: "" },
  silver: { type: String, default: "" },
  bronze: { type: String, default: "" },
  iron: { type: String, default: "" },
  stone: { type: String, default: "" },
});

const draftBotRoles = mongoose.model("Discord Roles", DiscordRoleSchema);

module.exports = draftBotRoles;
