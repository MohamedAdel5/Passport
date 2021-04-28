const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const FacebookStrategy = require("passport-facebook").Strategy;
const keys = require("./keys");
const User = require("../models/userModel");
const { urlencoded } = require("body-parser");
module.exports = (passport) => {
	passport.serializeUser(function (user, done) {
		//   console.log(user);
		done(null, user.id); //Adds user.id  to a cookie and send it to the user
		// In this done function the cookie will be signed using  either cookie-session or express-session
		// in the following syntax: req.session.payload = user.id;  (payload is arbitrary name)
	});

	//Retrieves the id from the cookie and gets the user then sends it to the request handler (There, you can access the user as req.user)
	//This fn is called for each request sent to the server not just the login requests.
	passport.deserializeUser(async function (id, done) {
		// Before the deserialize function is called, the id will be retrieved from the cookie
		// in the following syntax: id = req.session.payload  (payload is arbitrary name)
		const user = await User.findById(id);
		done(null, user);
	});

	// When you hit the endpoint /auth/google you will get redirected to google's consent screen
	// This redirection is done by the location http header that contains the redirection URL
	// The URL has a query string that contains:
	//  1) The id of the app by which you registered on googles oauth (client id) so that google knows what app is it and its domain.
	//  2) The url to which google will redirect the client after authentication
	//
	passport.use(
		new GoogleStrategy(
			{
				//options for strategy
				//To generate a client id : go to google developer console -> create credentials -> oauth client id -> app type = web app -> ..
				clientID: keys.google.clientID,
				clientSecret: keys.google.clientSecret,
				callbackURL: "/auth/google/redirect",
			},
			async function (accessToken, refreshToken, profile, done) {
				//passport callback function
				let user = await User.findOne({ googleID: profile.id });
				const userAlreadyLoggedIn = user;
				if (!userAlreadyLoggedIn) {
					user = await new User({
						username: profile.displayName,
						googleID: profile.id,
					}).save();
				}
				//send an error of null (no error) and send the user object to the next stage (serialize user) then to the redirect request handler
				//At the redirect request handler you can access the user object using (req.user)
				//[whatever the name you give to the user object in done method, you'll access it as req.user]
				done(null, user);
			}
		)
	);

	passport.use(
		new FacebookStrategy(
			{
				clientID: keys.facebook.clientID,
				clientSecret: keys.facebook.clientSecret,
				callbackURL: "/auth/facebook/redirect",
				profileFields: ["id", "email", "gender", "link", "name", "birthday", "location", "picture"],
			},
			async function (accessToken, refreshToken, profile, done) {
				console.log(profile);
				const { _json: profileInfo } = profile;
				let user = await User.findOne({ facebookID: profileInfo.id });
				const userAlreadyLoggedIn = user;
				if (!userAlreadyLoggedIn) {
					user = await new User({
						username: `${profileInfo.first_name} ${profileInfo.last_name}`,
						facebookID: profileInfo.id,
					}).save();
				}
				done(null, user);
			}
		)
	);
};
