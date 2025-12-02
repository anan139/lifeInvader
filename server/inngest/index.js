import { Inngest } from "inngest";
import User from "../models/user.js";

export const inngest = new Inngest({ id: "lifeinvader-app" });

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
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
    {event: 'clerk/user.updated'},
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
    {event: 'clerk/user.delete'},
    async({event}) =>{
        const {id} = event.data;

        try {
            await User.findByIdAndDelete(id);
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    }
);

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
];