import fs from 'fs';
import imageKit from '../configs/imageKit.js';
import Messege from '../models/Messege.js';

const connections = {};

export const sseController = (req, res) => {
  const { userId } = req.params; 
  console.log('New client connected: ', userId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache'); 
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  connections[userId] = res;
  res.write('log: connected to sse server\n\n');

  req.on('close', () => {
    delete connections[userId];
    console.log('Client disconnected: ', userId);
  });
};

export const sendMessage = async (req, res) => {
  try {
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = '';
    let messege_type = image ? 'image' : 'text';

    if (messege_type === 'image') {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imageKit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });

      media_url = imageKit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto', format: 'webp' },
          { width: '1280' },
        ],
      });
    }

    const messege = await Messege.create({
      from_user_id: userId, 
      to_user_id,
      text,
      messege_type,
      media_url,
    });

    res.json({ success: true, messege });

    const messegeWithUserData = await Messege.findById(messege._id).populate(
      'from_user_id'
    );

    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messegeWithUserData)}\n\n`
      );
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, messege: error.message });
  }
}

export const getChatMesseges = async (req, res) => {
    try {
       const {userId} = req.auth()
       const {to_user_id} = req.body;

       const messeges = await Messege.find({
        $or: [
            {from_user_id: userId, to_user_id},
            {from_user_id: to_user_id, to_user_id: userId},
        ]
       }).sort({createdAt: 1})
        await Messege.updateMany({from_user_id: to_user_id, to_user_id: userId, seen: true})
        res.json({success:true, messeges})
    } catch (error) {
        console.log(error);
        res.json({success:false, messege: error.messege})
    }
}

export const getUserRecentMesseges = async (req, res) => {
    try {
        const {userId} = req.auth()
        const messeges = await Messege.find({to_user_id: userId}).populate('from_user_id').sort({createdAt: -1})
        res.json({success:true, messeges});
    } catch (error) {
        console.log(error);
        res.json({success:false, messege: error.messege})
    }
}
