import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.DATABASE_URL);
const db = client.db("Medicare_connect");

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

}

});

