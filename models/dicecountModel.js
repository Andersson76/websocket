const mongoose = require("mongoose");

const DicecountSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  dicecount: {
    type: Number,
    required: true,
  },
  dicecountSum: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("dicecountInfo", DicecountSchema);
