import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isPasswordValid = await user.comparePassword(credentials.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    emailVerified: user.emailVerified,
                    isAdmin: user.isAdmin,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.emailVerified = user.emailVerified;
                token.isAdmin = user.isAdmin;
            }

            // Refetch user data on update trigger
            if (trigger === 'update') {
                try {
                    await connectDB();
                    const refreshedUser = await User.findById(token.id);
                    if (refreshedUser) {
                        token.emailVerified = refreshedUser.emailVerified;
                        token.isAdmin = refreshedUser.isAdmin;
                        // Update other fields as needed
                    }
                } catch (error) {
                    console.error('Error refreshing session:', error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.emailVerified = token.emailVerified;
                session.user.isAdmin = token.isAdmin;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.AUTH_SECRET,
});
