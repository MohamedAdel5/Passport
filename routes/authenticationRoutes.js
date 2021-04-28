const router = require("express").Router();
const passport = require("passport");

router.get("/login", (req, res) => {
  res.render("login");
});

router.get(
  //must be GET method
  "/google",
  passport.authenticate("google", {
    //Note that the scopes profile & email will not prompt the user with a consent screen.
    //And that's because they are not a big deal in security (google terms)
    //Adding more scopes will prompt the user.
    scope: ["profile", "email"],
  })
);

//This is the url that passport redirects the user to after authentication
//Passport adds a query string to this route that contains the parameter 'code'
//Now passport checks for this query parameter. If it exists, the authenticate function will not behave the same as above. Instead it will grap
// the users profile info and passes it to the call back function in passport setup config then serializeUser is fired then this request handler will get fired.
router.get(
  //must be GET method
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/auth/google/failure",
    successRedirect: "/user",
    session: true,
  })
  //You can add another route for success and pass it to option successRedirect
  //   (req, res) => {
  //      //success
  //     console.log("finally");
  //     console.log(req.user);
  //     res.send("done");
  //   }
);

router.get("/google/failure", (req, res) => {
  res.send("FAILED TO LOGIN WITH GOOGLE, PLEASE TRY AGAIN!");
});

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    //Note that all of these fields require App Review(set to live mode) check this: https://developers.facebook.com/docs/facebook-login/permissions
    scopes: ["email", "user_birthday", "user_gender", "user_location", "user_link", "user_photos"],
  })
);
router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/facebook/failure",
    successRedirect: "/user",
    session: true,
  })
);

router.get("/facebook/failure", (req, res) => {
  res.send("FAILED TO LOGIN WITH FACEBOOK, PLEASE TRY AGAIN!");
});

router.get("/unauthorized", (req, res) => {
  res.send("You're not logged in. Please login and try again.");
});

router.get("/logout", (req, res) => {
  //handle logging out
  req.session = null;
  req.logout();
  res.redirect("/");
});

module.exports = router;
