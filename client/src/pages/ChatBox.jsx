import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import { addMessages, fetchMessages, resetMessages } from '../features/messages/messagesSlice'
import toast from 'react-hot-toast'

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages)
  const { userId } = useParams()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(null) 
  const messagesEndRef = useRef(null)
  
  const connections = useSelector((state) => state.connections.connections)

  const fetchUserMessages = useCallback(async () => {
    try {
      const token = await getToken()
      dispatch(fetchMessages({ token, userId })) 
    } catch (error) {
      toast.error(error.message)
    }
  }, [getToken, userId, dispatch])

  const sendMessage = async () => {
    try {
      if (!text && !image) return

      const token = await getToken()
      const formData = new FormData()
      formData.append('to_user_id', userId)
      formData.append('text', text)
      image && formData.append('image', image)

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setText('')
        setImage(null)
        dispatch(addMessages(data.message))
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchUserMessages()
    
    return () => {
      dispatch(resetMessages())
    }
  }, [fetchUserMessages, dispatch])

  useEffect(() => {
    if (connections.length > 0) {
      const foundUser = connections.find(connection => connection._id === userId)
      setUser(foundUser)
    }
  }, [connections, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center gap-3">
          <img
            src={user.profile_picture || 'https://via.placeholder.com/40'}
            alt={user.full_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-gray-900">{user.full_name}</h2>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.from_user_id === userId ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  message.from_user_id === userId
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-red-500 text-white'
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Message attachment"
                    className="rounded-lg mb-2 max-w-full"
                  />
                )}
                {message.text && <p className="break-words">{message.text}</p>}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-2">
          <label htmlFor="image-upload" className="cursor-pointer">
            <ImageIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          
          {image && (
            <span className="text-sm text-green-600">Image selected ✓</span>
          )}

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={sendMessage}
            disabled={!text && !image}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <SendHorizonal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox