const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tree_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
    },
    tree_link: {
        type: String,
        required: true, 
    },
    created: {
        type: Date
    }
  
});

module.exports = mongoose.model("User", UserSchema);
