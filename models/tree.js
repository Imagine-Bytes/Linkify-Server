const mongoose = require("mongoose");

const TreeSchema = mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  main_url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tree_id: {
    type: String,
    required:true,
  },
  created: {
    type:Date
  }

  
});

module.exports = mongoose.model("Tree", TreeSchema);
