const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "secret",
};

passport.use(
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await User.findById(payload.sub);
      if (!user)
        return done(null, false, {
          message: "Token inválido - usuario no encontrado",
        });
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);
