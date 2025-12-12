import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Messege from "../models/Messege.js";

export const inngest = new Inngest({ id: "lifeinvader-app" });

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'user.created'},
    async({event}) =>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        let username = email_addresses[0].email_address.split('@')[0];

        const user = await User.findOne({username});

        if(user){
            username = username + Math.floor(Math.random()*10000);
        }

        const userdata = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username: username
        };

        try {
            await User.create(userdata);
        } catch (err) {
            console.error("Error creating user:", err);
        }
    }
);

const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'user.updated'},
    async({event}) =>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
        };

        try {
            await User.findByIdAndUpdate(id, updatedUserData);
        } catch (err) {
            console.error("Error updating user:", err);
        }
    }
);

const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'user.delete'},
    async({event}) =>{
        const {id} = event.data;

        try {
            await User.findByIdAndDelete(id);
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    }
);
const sendNewConnectionRequestReminder = inngest.createFunction(
    {id: "send-new-connection-request-reminder"},
    {event: "app/connection-request"},
    async ({ event, step }) => {
        const {connectionId} = event.data;

        await step.run('send-connection-request-mail', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
            const subject = `New Connection Request`
            const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hi ${connection.to_user_id.full_name},</h2>
            <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
            <br/>
            <p>Thanks,<br/>LifeInvader - Stay Connected</p>
            </div>`;
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })
        })
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil("wait-for-24-hours", in24Hours);
        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
            if(connection.status === "accepted"){
                return {messege: "Already accepted"}
            }
            const subject = `New Connection Request`
            const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hi ${connection.to_user_id.full_name},</h2>
            <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
            <br/>
            <p>Thanks,<br/>LifeInvader - Stay Connected</p>
            </div>`;
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })

            return {messege: "Reminder sent"}
        })
    }
)

const deleteStory = inngest.createFunction(
    {id: "story-delete"},
    {event: "app/story.delete"},
    async ({ event, step }) => {  
        const {storyId} = event.data;
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil("wait-for-24-hours", in24Hours);
        await step.run('delete-story', async () => {
            await Story.findByIdAndDelete(storyId);
            return {messege: "Story deleted"}
        })
    }
)

const sendNotificationOfUnseenMessages = inngest.createFunction(
    {id: "send-notification-of-unseen-messages"},
    {cron: "TZ=America/New_York 0 * * * *"},
    async (step) => {  
        const messages = await Messege.find({seen: false}).populate('to_user_id');
        const unseenCount = {};
        messages.forEach((message) => {
            const userId = message.to_user_id._id;
            unseenCount[userId] = (unseenCount[userId] || 0) + 1;
        });

        for(const userId in unseenCount){
            const user = await User.findById(userId);
            const subject = `You have ${unseenCount[userId]} unseen messages`;
            const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hi ${user.full_name},</h2>
            <p>You have ${unseenCount[userId]} unseen messages waiting for you.</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to check your messages</p>
            <br/>
            <p>Thanks,<br/>LifeInvader - Stay Connected</p>
            </div>`;
            await sendEmail({
                to: user.email,
                subject,
                body
            });
        } 
        return {messege: "Notifications sent"};
    }
)

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationOfUnseenMessages,
];
