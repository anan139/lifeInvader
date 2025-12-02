import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "lifeinvader-app" });
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async({event}) =>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        let username = email_addresses[0].email_addresses.split('@')[0]

        const user = await User.findOne({username})

        if(user){
            username = username + Math.floor(Math.random()*10000)
        }

        const userdata = {
            _id: id,
            email: email_addresses[0].email_addresses,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username:
        }
        await User.create(userData)
    }
)
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async({event}) =>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        
        const updatedUserData = {
            email: email_addresses[0].email_addresses,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
        }
        await User.findByIdAndUpdate(id, updatedUserData)
    }
)
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.delete'},
    async({event}) =>{
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
];