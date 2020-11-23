const mongoose = require("mongoose");

const TreeSchema = mongoose.Schema({

  main_url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tree_link: {
    type: String,
    required:true,
  },
  created: {
    type:Date
  }

  
});

module.exports = mongoose.model("Tree", TreeSchema);
