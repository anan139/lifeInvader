import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const RecentMessages = () => {
  const [messages, setMessages] = useState([])
  const {user} = useUser()
  const {getToken} =useAuth()
  const fetchRecentMessages = async () => {
    try {
      const token = await getToken()
      const {data} = await api.get('/api/user/recent-messages', {
        headers: {Authorization: `Bearer ${token}`}
      })
      if(data.success){
        setMessages((data.messages || []).sort((a, b)=> new Date(b.createdAt) - new Date(a.createdAt)))
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    let intervalId
    if(user){
      fetchRecentMessages() 
      intervalId = setInterval(fetchRecentMessages, 30000)
    }
    return () => {
      if(intervalId) clearInterval(intervalId)
    }
  }, [user])

  const currentUserId = user?.id
  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
      <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
      <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
        {messages.map((message) => {
          const isSender = message.from_user_id?._id === currentUserId
          const displayUser = isSender ? message.to_user_id : message.from_user_id
          const unread = !isSender && message.seen === false
          if (!displayUser) return null
          return (
            <Link to={`/messages/${displayUser._id}`} key={message._id} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
              <img src={displayUser.profile_picture} alt='' className='w-8 h-8 rounded-full' />
              <div className='w-full'>
                <div className='flex justify-between'>
                  <p className='font-medium'>{displayUser.full_name}</p>
                  <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-gray-500'>{message.text ? message.text : 'Media'}</p>
                  {unread && <p className='bg-red-400 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default RecentMessages
