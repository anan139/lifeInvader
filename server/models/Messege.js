import { text } from "express";
import mongoose from "mongoose";
 const messegeSchema = new mongoose.Schema({
     from_user_id: {type: String, ref: 'User', required: true},
     to_user_id: {type: String, ref: 'User', required: true},
     text: {type: String, trim: true},
     messege_type: {type: String, enum: ['text', 'image', 'video'], required: true},
     media_url: {type: String},
     seen: {type: Boolean, default: false},
 }, {timestamps: true, minimize: false})

 const Messege = mongoose.model('Messege', messegeSchema)

 export default Messege;
