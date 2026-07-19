import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'placeholder';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'placeholder';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'placeholder';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'placeholder';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${API_BASE_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return done(new Error('Database not connected'), undefined);
      }

      // Check if user already exists in our db with the given googleId
      let user = await User.findOneAndUpdate(
        { googleId: profile.id },
        { $set: { lastLogin: new Date() } },
        { new: true }
      );

      if (user) {
        return done(null, user);
      }

      // If not, check if user exists with the same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        const updateData: any = { 
          googleId: profile.id, 
          lastLogin: new Date() 
        };
        if (profile.photos && profile.photos[0]) {
          updateData.photoUrl = profile.photos[0].value;
        }

        user = await User.findOneAndUpdate(
          { email },
          { $set: updateData },
          { new: true }
        );
        
        if (user) {
          return done(null, user);
        }
      }

      // If user doesn't exist, create a new one
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName || 'Unknown',
        email: email || `${profile.id}@google.oauth`,
        photoUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        authProvider: 'google',
        role: 'user',
        xp: 0,
        level: 1,
        streakCount: 0,
        productivityScore: 50,
        onboarded: false,
        lastLogin: new Date()
      });

      done(null, user);
    } catch (err) {
      console.error('Google OAuth Error:', err);
      done(err as Error, undefined);
    }
  }
));

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `${API_BASE_URL}/api/auth/github/callback`,
    scope: ['user:email']
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return done(new Error('Database not connected'), undefined);
      }

      let user = await User.findOneAndUpdate(
        { githubId: profile.id },
        { $set: { lastLogin: new Date() } },
        { new: true }
      );

      if (user) {
        return done(null, user);
      }

      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        const updateData: any = { 
          githubId: profile.id, 
          lastLogin: new Date() 
        };
        if (profile.photos && profile.photos[0]) {
          updateData.photoUrl = profile.photos[0].value;
        }

        user = await User.findOneAndUpdate(
          { email },
          { $set: updateData },
          { new: true }
        );

        if (user) {
          return done(null, user);
        }
      }

      user = await User.create({
        githubId: profile.id,
        name: profile.displayName || profile.username || 'Unknown',
        email: email || `${profile.id}@github.oauth`,
        photoUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        authProvider: 'github',
        role: 'user',
        xp: 0,
        level: 1,
        streakCount: 0,
        productivityScore: 50,
        onboarded: false,
        lastLogin: new Date()
      });

      done(null, user);
    } catch (err) {
      console.error('GitHub OAuth Error:', err);
      done(err as Error, undefined);
    }
  }
));

export default passport;
