import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { AdapterUser } from "next-auth/adapters";

// Define credentials shape
interface Credentials {
  identifier: string;
  password: string;
}

// Optional: ExtendedUser for internal use in authorize()
interface ExtendedUser extends AdapterUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing credentials");
        }

        await dbConnect();

        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        });

        if (!user) {
          throw new Error("No user found with this email or username");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your account before login");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Incorrect password");
        }

        // Return user object with custom fields
        return user.toObject() as unknown as ExtendedUser;

      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as ExtendedUser;
        token._id = u._id;
        token.username = u.username;
        token.isVerified = u.isVerified;
        token.isAcceptingMessages = u.isAcceptingMessages;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
