const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const Links = require("../models/links");
const Tree = require("../models/tree");
const id = require("uuid");
const config = require("../config/config")
const options = { month: "long", day: "numeric" , year:"numeric"};
const today = new Date().toLocaleDateString([],options);

//Register User
router.post("/register", (req, res) => {
  const treeLink = () => {
    const slice = id().slice(24, 36);
    const mainLink = "http://linkify.io/t/" + slice;
    return mainLink;
  };

  const userData = {
    username: req.body.username,
    password: req.body.password,
    user_id: id(),
    tree_link: treeLink(),
    tree_id: id(),
    created: today,
  };


  User.findOne({
    username: req.body.username
  })
    .then((user) => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash;
          User.create(userData)
            .then((user) => {
              res.json({ message: " User Registered" });
            })
            .catch((err) => {
              res.json({ error: "Register Failed" });
              return;
            });
        });
      } else {
        res.json({ error: "User already exists" });
        return;
      }
    })
    .catch((err) => {
      res.send({ error: err });
      return;
    });
});

//Login User
router.post("/login", (req, res) => {

  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          const userInfo = {
            id: user.user_id,
            username: user.username
          };
          let token = jwt.sign(userInfo, config.secretKey, {
            expiresIn: 10000,
          });
  
          res.json({ status: "Login Successful", token: token });
          return
        } else {
          res.json({ error: "Password is incorrect" });
          return
        }
      } res.json({ error: "User doesn't exist" });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Get My Links via User ID
router.post("/mylinks", (req, res) => {
  const user_id = req.body.user_id;
  Links.find({ user_id: user_id })
    .then((links) => {
      if (links) { res.json({ message: "success", results: links }); return }
      res.json({error:"User ID doesn't exist"})
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Get Link Tree via Tree ID
router.post("/mytree", (req, res) => {
  const tree_id = req.body.tree_id;
  Tree.find({ tree_id: tree_id })
    .then((tree) => {
      res.json({ message: "success", results: tree });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Create Shortened Link
router.post("/shortenlink", (req, res) => {
  const shortLink = () => {
    const slice = id().slice(0, 6);
    const mainLink = "http://localhost:3000/s/" + slice;
    return mainLink;
  };
  const linkData = {
    link: shortLink(),
    main_url: req.body.main_url,
    status: req.body.status || "OK",
    user_id: req.body.user_id || "0000",
    created: today,
  };

  Links.create(linkData)
    .then((link) => {
      res.json({ message: "Link has been Shortened" });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Add Link to Tree
router.post("/addLink", (req, res) => {
  const shortLink = () => {
    const slice = id().slice(24, 36);
    const mainLink = "http://linkify.io/" + slice;
    return mainLink;
  };
  const linkData = {
    link: shortLink(),
    main_url: req.body.main_url,
    name: req.body.name,
    tree_id: req.body.tree_id,
    created: today,
  };

  Tree.create(linkData)
    .then((link) => {
      res.json({ message: "Link has been added to Tree" });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Redirect Shortened Links // The use of localhost is for development purposes only, on deploy it will be linkify.io
router.get("/s/:link", (req, res) => {
  const fullLink = "http://localhost:3000/s/" + req.params.link;
  Links.findOne({ link: fullLink })
    .then((link) => {
      if (link) {
        const mainLink = link.main_url;
        res.redirect(mainLink);
        return
      }
      res.json({error:"Link doesn't exist"})
    })
    .catch((err) => {
    res.json({error:err})
  })
})



module.exports = router;
