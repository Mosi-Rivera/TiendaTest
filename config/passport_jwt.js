const {Strategy, ExtractJwt} = require('passport-jwt');
const User = require('../models/User');
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true
};

module.exports = (passport) => {
    passport.use(new Strategy(opts, async (req, jwt_payload, done) => {
        try
        {
            const user = await User.findOne({_id: jwt_payload._id});
            if (user)
            {
                req.user = user;
                return done(null, user);
            }
            return done(null, false);
        }
        catch(err)
        {
            return done(err, false);
        }
    }));
}