const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  userId: { type: String, require: true },
  name: { type: String },
  lp: { type: Number, default: 1000 },
  killratio: { type: String, default: "**0 / 0**" },
  totalWin: { type: Number, default: 0 },
  totalLoss: { type: Number, default: 0 },
  win: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  value: { type: String },
  draftPlayed: { type: Array, default: [0, 1] },
  lpChange: { type: Array, default: [1000] },
  bestSeason: { type: String, default: "0" },
  bestRank: { type: String, default: "0" },
  previousSeason: { type: String, default: "0" },
  newPlayer: { type: Boolean, default: true },
  playedSeason: { type: Boolean, default: false },
  medals: { type: Array, default: [] },
  recentGames: { type: Array, default: [] },
  recentGamesCreated: { type: Array, default: [] },
});

const player = mongoose.model("PlayerModels", PlayerSchema);
player.createIndexes({ guildId: 1 });
module.exports = player;
