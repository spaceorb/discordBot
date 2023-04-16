const mongoose = require("mongoose");

const AllServersSchema = new mongoose.Schema({
  guildId: { type: String, require: true, unique: true },
  guildName: { type: String, require: true },
  guildOwnerId: { type: String, require: true },
  guildMemberCount: { type: String },
  guildEmojis: { type: Object },
  guildPrefix: { type: String },
  guildJoinedDate: { type: String },
  guildMainChannel: { type: String },
  guildRankChannel: { type: String },
  guildWinnersChannel: { type: String },
  guildDraftResultChannel: { type: String },
  banList: { type: Array },
});

const AllServers = mongoose.model("ServerModels", AllServersSchema);
AllServers.createIndexes({ guildId: 1 });

module.exports = AllServers;
