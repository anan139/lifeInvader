import { clerkClient } from '@clerk/express';

export const protect = async (req, res, next) => {
  try {
    let { userId } = req.auth();
    if (!userId) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const verified = await clerkClient.verifyToken(token);
        userId = verified.sub;
        req.userId = userId;
      }
    }
    
    if (!userId) {
      return res.json({success: false, message: "not authenticated"});
    }
    
    next();
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}
