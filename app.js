const passport = require("passport");
const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/authenticationRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const keys = require("./config/keys");

mongoose.connect(
	keys.mongodb.dbURI,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	() => {
		console.log("✔ connected to DB successfully.");
	}
);

// A user session can be stored in two main ways with cookies: on the server or on the client.
// cookie-session module stores the session data on the client within a cookie
// (e.g: sends a cookie with a jwt token that has the user's id in it without storing this session in the db
// so when the user sends any other requests, we wil keep track of him by decoding the jwt and getting his id),
// while express-session module stores only a session identifier on the client within a cookie and
// stores the session data on the server, typically in a database.
// (e.g: Whenever any user sends any request to the server he will get a cookie with a unique session id
//  that is going to identify him in every upcoming request. This session will be stored in a session store
// like `connect-mongo` and will be associated with an object that contains all the data of the session
// like the user id)
// Both modules add data to the session using the same syntax which is req.session.payload = data
// and retrieve data: retrieved = req.session.payload
// Passport signs and accepts these cookies and sessions in its functions behind the scene.

const sessionStore = new MongoStore({
	mongooseConnection: mongoose.connection,
	collection: "sessions",
});

app.use(
	session({
		secret: "TopSecretSecret1234567",
		resave: false,
		saveUninitialized: true,
		store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
		},
	})
);

// app.use(
// 	cookieSession({
// 		name: keys.session.name,
// 		keys: keys.session.keys,
// 		maxAge: keys.session.maxAge,
// 	})
// );

//set up view engine
app.set("view engine", "ejs");
app.set("trust proxy", true);

//Calling passportSetup code to run.
require("./config/passportSetup")(passport);

//comment this out if you don't want a cookie session to be stored on the users browser (to prevent remembering the user)
//And add the option session: false in the redirect middleware.
//And comment out serializeUser & deserializeUser configuration functions.
app.use(passport.initialize()); // This fn is used only when sessions are used. Visit: https://stackoverflow.com/questions/46644366/what-is-passport-initialize-nodejs-express
app.use(passport.session());

app.use((req, res, next) => {
	console.log(req.session);
	console.log(req.user);
	next();
});

app.get("/", (req, res) => {
	//I was just testing how to get the ip address of the current user
// 	var ip =
		// (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
		// req.connection.remoteAddress ||
		// req.socket.remoteAddress ||
		// req.connection.socket.remoteAddress;
		// console.log(ip);
		res.render("home");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.listen(3000, "127.0.0.1", () => {
	console.log("✔ listening to port 3000...");
});
