import React, {useEffect, useState } from 'react'
import { dummyRecentMessagesData } from '../assets/assets'
import { Link } from 'react-router-dom'
const RecentMessages = () => {

      const [messages, setMessages] = useState([])
      const fetchRecentMessages = async () => {
        setMessages(dummyRecentMessagesData)
      }
        useEffect(() =>{ fetchRecentMessages() },[])
    return (
        <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
            <h3 className='font-semibold text-slate-8 mb-4'>Recent Messages</h3>
            <div className='flex flex-col max-h-56 overflow-y-scrol no-scrollbar'>
                {messages.map((message, index) => (<Link to={`/messages/${message.from_user_id._id}`} key={index} clasName='flex 
            item-start gap-2 pu-2 hover:bg-slate-100'> 
             <img src={message.from_user_id.profile_picture} alt="" className='w-8 h-8 rounded-full'/>
                   <div className='w-full'>
                    <div className='flex justify-between'>
                        <p className='font-medium'>{message.from_user_id.full_name}</p>
                        <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
                    </div>
                    <div className='flex justify-between'>
                        <p className='text-grey-500'>{message.text ? message.text : 'Media' }</p>
                        {message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex item-center justify-center rounded-full text-[10px]'>1</p>}
                    </div>
                   </div>
                    
            </Link>))
            }
            </div>
            Recent Messages Component
        </div>
    )
}
export default RecentMessages