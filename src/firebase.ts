/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Try to parse configuration loaded into window or environment
const metaEnv = (import.meta as any).env || {};
const envApiKey = metaEnv.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: envApiKey || "dummy-api-key",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app;
let auth: any;
let db: any;
let isFirebaseConfigured = false;

// If a real API key is detected, attempt to bootstrap Firebase SDK
if (envApiKey && envApiKey !== "dummy-api-key" && !envApiKey.startsWith("MY_")) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("Firebase has successfully connected with dynamic credential profile.");
  } catch (e) {
    console.warn("Firebase initialization error, utilizing secure offline emulation:", e);
  }
}

// Safe default setup to prevent null pointer crashes or reference compilation errors
if (!app) {
  const dummyConfig = {
    apiKey: "dummy-api-key",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  };
  app = getApps().length === 0 ? initializeApp(dummyConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseConfigured = false;
  console.log("Firebase initialized in SECURE OFFLINE simulation mode.");
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, auth, db, googleProvider, githubProvider, isFirebaseConfigured };
