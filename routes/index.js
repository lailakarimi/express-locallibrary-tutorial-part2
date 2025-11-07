var express = require('express');
var router = express.Router();

// Redirect root to catalog
router.get("/", (req, res) => {
  res.redirect("/catalog");
});

module.exports = router;
