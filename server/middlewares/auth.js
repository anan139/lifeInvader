import { clerkClient } from '@clerk/express';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({success: false, message: "No token provided"});
    }
    const token = authHeader.replace('Bearer ', '');
    const verified = await clerkClient.verifyToken(token);
    req.userId = verified.sub;
    req.auth = () => ({ userId: verified.sub });
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    return res.status(403).json({success: false, message: "Invalid token"});
  }
}
