// require feature from apollo package
const { AuthenticationError } = require('apollo-server-express');
// User model
const { User } = require('../models');
// require auth middleware
const { signToken } = require('../utils/auth');

// 
const resolvers = {
    // query to obtain user
    Query: {
        // 'me' = user that is logged in to app
        me: async (parent, args, context) => {
            if (context.user) {
                // ripped from TA :)
                const userData = await User.findOne({ _id: context.user._id }).select("-__v -password");
                return userData;
            }
            throw new AuthenticationError('Please log into the application :)');
        },
    },

    // mutation to add a user
    Mutation: {
        addUser: async (parent, args) => {
            // new user + signup form
            const user = await User.create(args);
            const token = signToken(user);
            // once token assigned with user:
            return { token, user };
        },

        //  login form
        login: async (parent, { email, password }) => {

            // user check
            const user = await User.findOne({ email });

            // alert if user email not a match
            if (!user) {
                throw new AuthenticationError('The information provided does not match our records. Please try again!');
            }

            // password check
            const correctPw = await user.isCorrectPassword(password);

            // alert if password not a match
            if (!correctPw) {
                throw new AuthenticationError('The information provided does not match our records. Please try again!');
            }
        },

        // saveBook accepts input with specific params
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.input } },
                    { new: true }
                );

                return updatedUser;
            }
            // if user is not matched then auth error:
            throw new AuthenticationError('Please log in to save!');
        },

        // removeBook with previous params
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    // return value with 'pull'
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
            // if user does not match then auth error:
            throw new AuthenticationError('Please log in to save!');
        }

    },

}


module.exports = resolvers;