import { Locale, routing } from '@/i18n/routing';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import AuthToken from '../db/models/AuthToken';
import User, { IUser } from '../db/models/User';
import connectToDatabase from '../db/mongodb';
import { sendMagicLinkEmail } from '../email/email';
import { NextResponse, NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const TOKEN_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthResult {
  success: boolean;
  user?: UserInfo;
  authToken?: string;
  message?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
}

/**
 * Generate a secure random token for magic link authentication
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create and store an authentication token for the given email
 */
export async function createAuthToken(email: string): Promise<string> {
  await connectToDatabase();

  const token = generateToken();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_TIME);

  // Store the token in the database
  await AuthToken.create({
    token,
    email,
    expires,
  });

  return token;
}

/**
 * Send a magic link to the user's email
 */
export async function sendAuthEmail(email: string, locale: Locale = 'en'): Promise<boolean> {
  const token = await createAuthToken(email);
  
  // Get the localized verify path for the given locale
  const verifyPaths = routing.pathnames['/verify'];
  const localizedVerifyPath = verifyPaths[locale] || verifyPaths.en;
  
  // Construct the full URL with localized verify path
  const url = `${APP_URL}/${locale}${localizedVerifyPath}?token=${token}`;

  await sendMagicLinkEmail(email, url, locale);

  return true;
}

/**
 * Verify an authentication token and authenticate the user
 */
export async function verifyAuthToken(token: string): Promise<AuthResult> {
  await connectToDatabase();

  // Find the token in the database
  const tokenDoc = await AuthToken.findOne({
    token,
    expires: { $gt: new Date() },
    used: false,
  });

  if (!tokenDoc) {
    return { success: false, message: 'Invalid or expired token' };
  }

  // Mark the token as used
  tokenDoc.used = true;
  await tokenDoc.save();

  // Find or create the user
  const user = (await User.findOneAndUpdate(
    { email: tokenDoc.email },
    {
      $setOnInsert: { email: tokenDoc.email },
      $set: {
        emailVerified: new Date(),
        lastLogin: new Date(),
      },
    },
    { new: true, upsert: true }
  )) as IUser;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  // Generate a JWT for the authenticated session
  const authToken = jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as string } as jwt.SignOptions
  );

  return {
    success: true,
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    },
    authToken,
  };
}

/**
 * Set the authentication token in a cookie
 */
export function setAuthCookie(response: NextResponse, authToken: string): NextResponse {
  response.cookies.set('authToken', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

/**
 * Remove the authentication cookie
 */
export function removeAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete('authToken');
  return response;
}

/**
 * Get the current authenticated user from the JWT
 */
export async function getCurrentUser(request?: NextRequest): Promise<UserInfo | null> {
  let authToken: string | undefined;

  if (request) {
    // Get the token from the request cookies
    authToken = request.cookies.get('authToken')?.value;
  } else {
    // Get the token from the server-side cookies
    const cookieStore = await cookies();
    authToken = cookieStore.get('authToken')?.value;
  }

  if (!authToken || !JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(authToken, JWT_SECRET) as JwtPayload;

    await connectToDatabase();
    const user = (await User.findById(decoded.sub)) as IUser | null;

    if (!user) {
      return null;
    }

    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
