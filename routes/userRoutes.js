const router = require("express").Router();

const protect = (req, res, next) => {
  if (!req.user) {
    res.redirect("/auth/unauthorized");
  } else {
    next();
  }
};

router.get("/", protect, (req, res) => {
  res.send(req.user);
});

module.exports = router;
