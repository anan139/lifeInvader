import { clerkClient } from '@clerk/express';

export const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    
    if (userId) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const verified = await clerkClient.verifyToken(token);
      
      req.auth = () => ({ userId: verified.sub });
      return next();
    }
    return res.status(401).json({success: false, message: "Not authenticated"});
    
  } catch (error) {
    console.log('Auth error:', error.message);
    return res.status(403).json({success: false, message: "Invalid authentication"});
  }
}
