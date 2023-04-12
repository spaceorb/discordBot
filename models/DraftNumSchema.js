const mongoose = require("mongoose");

const DraftNumSchema = new mongoose.Schema({
  draftNum: { type: Number },
});

const draftNum = mongoose.model("draftNumModel", DraftNumSchema);

module.exports = draftNum;
