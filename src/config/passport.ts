import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { JwtPayload, AuthUser } from '../types/index.js';
import { JWT_SECRET } from '../utils/constants.js';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, (payload: JwtPayload, done) => {
    // Transform JWT payload into AuthUser
    const user: AuthUser = {
      userId: payload.userId,
      username: payload.username
    };
    return done(null, user);
  })
);

export default passport;