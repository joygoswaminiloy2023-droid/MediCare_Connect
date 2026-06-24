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

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "patient",
        required: false,
        input: true,
      },
      status: {
        type: "string",
        default: "active",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.role || "patient",
              status: "active",
            },
          };
        },
      },
      after: async (user) => {
        try {
          const oid = toObjectId(user.id);

          await db.collection("user").updateOne(
            { $or: [{ _id: user.id }, ...(oid ? [{ _id: oid }] : [])] },
            {
              $set: {
                role: user.role || "patient",
                status: "active",
              },
            }
          );

          console.log("User saved:", user.email, "Role:", user.role || "patient");
        } catch (err) {
          console.error("Error saving user:", err);
        }
        return user;
      },
    },
    // NOTE: the banned-account check used to live here as a
    // session.create.before throw. That breaks the Google OAuth
    // redirect flow — better-auth returns the raw APIError as JSON
    // instead of redirecting to errorCallbackURL. Moved to hooks.after
    // below so we can control the redirect ourselves.
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (!newSession) return;

      const dbUser = await findUserById(newSession.user.id);
      if (dbUser?.status !== "banned") return;

      // Kill the session we just created for the banned user
      await ctx.context.internalAdapter.deleteSession(newSession.session.token);

      const isOAuthCallback = ctx.path?.startsWith("/callback");

      if (isOAuthCallback) {
        // Full browser navigation (Google sign-in) — redirect back to
        // the frontend so AuthPage's useEffect can show the toast.
        const redirectURL = new URL("/Authentication_pages", ctx.context.baseURL);
        redirectURL.searchParams.set("error", "banned");
        throw ctx.redirect(redirectURL.toString());
      }

      // Email/password sign-in is a fetch() call — a plain APIError
      // comes back as JSON that authClient.signIn.email can read.
      throw new APIError("FORBIDDEN", {
        message: "Your account has been permanently banned.",
      });
    }),
  },
});