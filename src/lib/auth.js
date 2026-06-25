import { betterAuth } from "better-auth";
import { MongoClient, ObjectId } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";

const client = new MongoClient(process.env.DATABASE_URL);
const db = client.db("Medicare_connect");

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

async function findUserById(userId) {
  const oid = toObjectId(userId);
  return db.collection("user").findOne({
    $or: [{ _id: userId }, ...(oid ? [{ _id: oid }] : [])],
  });
}

// ─── baseURL must match THIS app's own domain — it serves /api/auth/* itself ───
const BASE_URL =
  process.env.BETTER_AUTH_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://medicare-connect-three.vercel.app"
    : "http://localhost:3000");

console.log("BetterAuth BASE_URL:", BASE_URL);

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  baseURL: BASE_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${BASE_URL}/api/auth/callback/google`,
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", default: "patient", required: false, input: true },
      status: { type: "string", default: "active", required: false },
    },
  },
  session: {
    customSessionValidationFn: async (session, raw) => {
      if (!session.userId) return null;
      const user = await findUserById(session.userId);
      if (!user) return null;
      return {
        ...session,
        user: { ...session.user, role: user.role || "patient", status: user.status || "active" },
      };
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, role: user.role || "patient", status: "active" },
        }),
      },
      after: async (user) => {
        try {
          const oid = toObjectId(user.id);
          await db.collection("user").updateOne(
            { $or: [{ _id: user.id }, ...(oid ? [{ _id: oid }] : [])] },
            { $set: { role: user.role || "patient", status: "active" } }
          );
        } catch (err) {
          console.error("Error saving user:", err);
        }
        return user;
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (!newSession) return;
      const dbUser = await findUserById(newSession.user.id);
      if (dbUser?.status !== "banned") return;
      await ctx.context.internalAdapter.deleteSession(newSession.session.token);
      const isOAuthCallback = ctx.path?.startsWith("/callback");
      if (isOAuthCallback) {
        const redirectURL = new URL("/Authentication_pages", ctx.context.baseURL);
        redirectURL.searchParams.set("error", "banned");
        throw ctx.redirect(redirectURL.toString());
      }
      throw new APIError("FORBIDDEN", { message: "Your account has been permanently banned." });
    }),
  },
});