const mongoose = require("mongoose");

const LinkSchema = mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  main_url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  user_id: {
    type: String,
  },
  created: {
    type: Date
  }
  
});

module.exports = mongoose.model("Links", LinkSchema);
