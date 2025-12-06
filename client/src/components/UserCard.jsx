import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapPin, UserPlus, MessageCircle, Plus, UserCheck } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/user/userSlice'

const UserCard = ({ user }) => {
  const currentUser = useSelector((state) => state.user.value)
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isFollowing = currentUser?.followings?.some(id => id === user._id)
  const isConnected = currentUser?.connections?.some(id => id === user._id)

  const handleFollow = async () => {
    if (isFollowing) {
      try {
        const { data } = await api.post('/api/user/unfollow', { id: user._id }, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) {
          toast.success(data.message)
          dispatch(fetchUser(await getToken()))
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    } else {
      try {
        const { data } = await api.post('/api/user/follow', { id: user._id }, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) {
          toast.success(data.message)
          dispatch(fetchUser(await getToken()))
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const handleConnectionRequest = async () => {
    if (isConnected) {
      return navigate('/messages/' + user._id)
    }

    try {
      const { data } = await api.post('/api/user/connect', { id: user._id }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center">
        <img
          src={user.profile_picture || 'https://via.placeholder.com/100'}
          alt={user.full_name}
          className="w-20 h-20 rounded-full object-cover mb-4"
        />

        <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
        {user.username && (
          <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
        )}

        {user.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin size={14} />
            <span>{user.location}</span>
          </div>
        )}

        {user.bio && (
          <p className="text-sm text-gray-700 text-center mb-4 line-clamp-2">
            {user.bio}
          </p>
        )}

        <div className="flex gap-2 w-full">
          <button
            onClick={handleFollow}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          <button
            onClick={handleConnectionRequest}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isConnected
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isConnected ? <MessageCircle size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserCard
