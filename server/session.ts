import session from "express-session";
import connectPg from "connect-pg-simple";

const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPg(session);

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'boyfanz-secret-key-change-in-production',
  store: new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax", // CSRF protection
    maxAge: sessionTtl,
  },
});
