const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const Links = require("../models/links");
const Tree = require("../models/tree");
const dailyTimer = require("./dailyTimer");
const verifyToken = require("./verifyToken");
const generateToken = require("./generateToken");
const id = require("uuid");
const dateFormat = { month: "long", day: "numeric", year: "numeric" };
const today = new Date().toLocaleDateString([], dateFormat);
dailyClicks = 0;
totalClicks = 0;
linkShortened = 0;
LinksAddedToTrees = 0;

// Timer for Daily Clicks
dailyTimer();

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
    created: today,
  };
  User.findOne({
    username: req.body.username,
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
          const id = user.id;
          const link = user.tree_link;
          const username = user.username;
          generateToken(res, link, id, username);
          res.json({ status: "Login Successful" });
          return;
        } else {
          res.json({ error: "Password is incorrect" });
          return;
        }
      }
      res.json({ error: "User doesn't exist" });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Get My Links via User ID
router.get("/mylinks", verifyToken, (req, res) => {
  const user_id = req.user.id;
  Links.find({ user_id: user_id })
    .then((links) => {
      if (links) {
        res.json({ message: "success", results: links });
        return;
      }
      res.json({ error: "User ID doesn't exist" });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Get Link Tree via Tree Link
router.get("/mytree", verifyToken, (req, res) => {
  const tree_link = req.user.link;
  Tree.find({ tree_link: tree_link })
    .then((tree) => {
      res.json({ message: "success", results: tree });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// Create Shortened Link for Logged In users
router.post("/shorten", verifyToken, (req, res) => {
  linkShortened += 1;
  const shortLink = () => {
    const slice = id().slice(0, 6);
    const mainLink = "http://linkifyserver/s/" + slice;
    return mainLink;
  };
  const linkData = {
    link: shortLink(),
    main_url: req.body.main_url,
    status: req.body.status || "OK",
    user_id: req.user.id || "0000",
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


// Create Shortened Link for One-Time Users
router.post("/shortenOnce", (req, res) => {
  linkShortened += 1;
  const shortLink = () => {
    const slice = id().slice(0, 6);
    const mainLink = "http://linkifyserver/s/" + slice;
    return mainLink;
  };
  const linkData = {
    link: shortLink(),
    main_url: req.body.main_url,
    status: req.body.status || "OK",
    user_id: "0000",
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
router.post("/addLink", verifyToken, (req, res) => {
  LinksAddedToTrees += 1
  const linkData = {
    main_url: req.body.main_url,
    name: req.body.name,
    tree_link: req.user.link,
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
  dailyClicks += 1;
  totalClicks += 1;

  const fullLink = "http://linkifyserver/s/" + req.params.link;
  Links.findOne({ link: fullLink })
    .then((link) => {
      if (link) {
        const mainLink = link.main_url;
        res.status(301).redirect(mainLink);
        return;
      }
      res.json({ error: "Link doesn't exist" });
      return
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

//Admin Route
router.get("/admin", (req, res) => {
  User.find()
    .countDocuments()
    .then((users) => {
      res.json({
        users: users,
        totalClicks: totalClicks,
        dailyClicks: dailyClicks,
        linkShortened: linkShortened,
      });
    });
});

module.exports = router;
