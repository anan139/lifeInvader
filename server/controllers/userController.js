import imageKit from '../configs/imageKit.js';
import User from '../models/User.js';
import fs from 'fs';
import Connection from '../models/Connection.js';
import Post from '../models/Post.js';
import { inngest } from '../inngest/index.js';

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    return res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;
    
    const tempUser = await User.findById(userId);
    
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }
    
    if (!username) {
      username = tempUser.username;
    }
    
    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = tempUser.username; 
      }
    }
    
    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };
    
    const profile = req.files?.profile?.[0];
    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imageKit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      
      const url = imageKit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '512' }
        ]
      });
      
      updatedData.profile_picture = url;
    }
    
    const cover = req.files?.cover?.[0];
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imageKit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      
      const url = imageKit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '1280' }
        ]
      });
      
      updatedData.cover_photo = url;
    }
    
    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    return res.json({ success: true, user, message: 'Profile updated successfully' });
    
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;
    
    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, 'i') },
        { email: new RegExp(input, 'i') },
        { full_name: new RegExp(input, 'i') },
        { location: new RegExp(input, 'i') }, 
      ]
    });

    const filteredUsers = allUsers.filter(user => user._id.toString() !== userId);
    return res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { id } = req.body;
    
    const user = await User.findById(userId)
    
    if (user.followings.includes(id)) {
      return res.json({ success: false, messege: 'You are already following this user' })
    }
    
    user.followings.push(id);
    await user.save()
    
    const toUser = await User.findById(id)
    toUser.followers.push(userId)
    await toUser.save()
    
    return res.json({ success: true, messege: 'You are following this user' })
  } catch (error) {
    console.log(error);
    return res.json({ success: false, messege: error.message })
  }
}


export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { id } = req.body;
    
    const user = await User.findById(userId)
    user.followings = user.followings.filter(following => following.toString() !== id);
    await user.save()
    
    const toUser = await User.findById(id)
    toUser.followers = toUser.followers.filter(follower => follower.toString() !== userId);
    await toUser.save()
    
    return res.json({ success: true, messege: 'You are no longer following this user' })
  } catch (error) {
    console.log(error);
    return res.json({ success: false, messege: error.message })
  }
}


export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequests = await Connection.find({
      from_user_id: userId,
      created_at: { $gte: last24Hours }
    });
    
    if (recentRequests.length >= 20) {
      return res.json({ 
        success: false, 
        message: "You have sent 20 requests in the last 24 hours. Please try again later." 
      });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ]
    });
    
    if (!existingConnection) {
      const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id
      });
      
      await inngest.send({
        name: "app/connection-request",
        data: {
          connectionId: newConnection._id
        }
      });
      
      return res.json({ success: true, message: "Connection request sent" });
      
    } else if (existingConnection.status === 'accepted') {
      return res.json({ success: false, message: "Already connected" });
    }
    
    return res.json({ success: false, message: "Connection request pending" });
    
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    
    const user = await User.findById(userId).populate('connections followers followings');
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    const connections = user.connections;
    const followers = user.followers;
    const followings = user.followings;
    
    const pendingConnections = await Connection.find({
      to_user_id: userId,
      status: 'pending'
    }).populate('from_user_id');
    
    const pendingUsers = pendingConnections.map(conn => conn.from_user_id);
    
    return res.json({ 
      success: true, 
      connections, 
      followers, 
      followings, 
      pendingConnections: pendingUsers 
    });
    
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;
    
    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId
    });
    
    if (!connection) {
      return res.json({ success: false, message: "Connection request not found" });
    }
    
    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();
    
    const requestUser = await User.findById(id);
    requestUser.connections.push(userId);
    await requestUser.save();
    
    connection.status = 'accepted';
    await connection.save();
    
    return res.json({ success: true, message: "Connection request accepted" });
    
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;
    
    const profile = await User.findById(profileId);
    
    if (!profile) {
      return res.json({ success: false, message: "Profile not found" });
    }
    
    const posts = await Post.find({ user: profileId }).populate('user');
    
    return res.json({ success: true, profile, posts });
    
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};
