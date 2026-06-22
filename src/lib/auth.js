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
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
  },
  user: {
    additionalFields: {
      role: {
        default: "Patient"
      }
    }
  },
  databaseHooks: {
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