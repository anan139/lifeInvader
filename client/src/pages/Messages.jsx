import React, { useEffect, useState } from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth, useUser } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import moment from 'moment'

const Messages = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()
  const fallbackConnections = useSelector((state)=>state.connections.connections || [])
  const [threads, setThreads] = useState([])

  const fetchRecentThreads = async () => {
    try {
      const token = await getToken()
      const { data } = await api.get('/api/user/recent-messages', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        const sorted = (data.messages || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setThreads(sorted)
      } else {
        toast.error(data.message || 'Failed to load messages')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRecentThreads()
    }
  }, [user])

  const list = threads.length ? threads : fallbackConnections.map(conn => ({
    _id: conn._id,
    latest: null,
    user: conn
  }))

  const renderCard = (item) => {
    // item could be thread from API or fallback connection
    const isThread = !!item.createdAt
    const currentUserId = user?.id
    const isSender = isThread && item.from_user_id?._id === currentUserId
    const displayUser = isThread ? (isSender ? item.to_user_id : item.from_user_id) : item.user
    if (!displayUser) return null

    const unread = isThread && !isSender && item.seen === false
    const preview = isThread ? (item.text || 'Media') : (displayUser.bio || 'Say hi!')
    const timeLabel = isThread ? moment(item.createdAt).fromNow() : ''

    return (
      <div key={isThread ? item._id : displayUser._id} className='max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md'>
        <img src={displayUser.profile_picture} alt='' className='rounded-full size-12 mx-auto' />
        <div className='flex-1 min-w-[10rem]'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='front-medium text-slate-700'>{displayUser.full_name}</p>
              <p className='text-slate-500'>@{displayUser.username}</p>
            </div>
            {timeLabel && <p className='text-[11px] text-slate-400'>{timeLabel}</p>}
          </div>
          <div className='flex items-center gap-2 mt-1'>
            <p className='text-sm text-slate-600 line-clamp-1'>{preview}</p>
            {unread && <span className='bg-red-500 text-white rounded-full px-2 text-[10px]'>new</span>}
          </div>
        </div>
        <div className='flex flex-col gap-2 mt-4'>
          <button onClick={() => navigate(`/messages/${displayUser._id}`)} className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1 relative'>
            <MessageSquare className='w-4 h-4' />
            {unread && <span className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]'>!</span>}
          </button>
          <button onClick={() => navigate(`/profile/${displayUser._id}`)} className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'>
            <Eye className='w-4 h-4' />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl front-bold text-slate-900 mb-2'>Messages</h1>
          <p className='text-slate-600'>Talk to your friends and family</p>
        </div>
        <div className='flex flex-col gap-3'>
          {list.length ? list.map(renderCard) : (
            <div className='text-slate-500'>No conversations yet. Start one from Connections.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
