const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET
const fetchuser = require("../middleware/fetchuser");

// create a user using : POST "/api/auth/creatuser". No login required
router.post("/createuser", async (req, res) => {
  // if there are errors return bad request

  // check whether the email exit already
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ error: "Sorry a user with this email already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      // create a new user
      let user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// authenticate a user using : POST "/api/auth/login". No login required
router.post("/login", async (req, res) => {
  // if there are errors return bad request
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Please try to login with correct credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res
        .status(400)
        .json({ error: "Please try to login with correct credentials" });
    }
    const data = {
      user: {
        id: user.id,
      },
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ authToken });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// get loggedin user details using : POST "/api/auth/getuser". No login required
router.get("/getUser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

// update a user using : PUT "/api/auth/updateUser". Login required
router.put("/updateUser", fetchuser, async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findById(req.user.id);
    user.name = name;
    user.email = email;
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
