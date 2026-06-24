import { betterAuth } from "better-auth";
import { MongoClient, ObjectId } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError } from "better-auth/api";

const client = new MongoClient(process.env.DATABASE_URL);
const db = client.db("Medicare_connect");

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
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

          console.log("✅ User saved:", user.email, "Role:", user.role || "patient");
        } catch (err) {
          console.error("❌ Error saving user:", err);
        }
        return user;
      },
    },
    session: {
      create: {
        before: async (session) => {
          const oid = toObjectId(session.userId);
          const dbUser = await db.collection("user").findOne({
            $or: [{ _id: session.userId }, ...(oid ? [{ _id: oid }] : [])],
          });

          if (dbUser?.status === "banned") {
            throw new APIError("FORBIDDEN", {
              message: "Your account has been permanently banned.",
            });
          }

          return { data: session };
        },
      },
    },
  },
});