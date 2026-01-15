import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { JwtPayload } from '../types/index.js';
import { JWT_SECRET } from '../utils/constants.js';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, (payload: JwtPayload, done) => {
    return done(null, payload);
  })
);

export default passport;