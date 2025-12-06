import React, { useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { fetchConnections } from '../features/connections/connectionsSlice'
import { fetchUser } from '../features/user/userSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Connections = () => {
  const [currentTab, setCurrentTab] = React.useState('Followers')
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  
  const currentUser = useSelector((state) => state.user.value)
  const { connections = [], pendingConnections = [], followers = [], following = [] } = useSelector((state) => state.connections) || {}

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Pending', value: pendingConnections, icon: UserRoundPen },
    { label: 'Connections', value: connections, icon: UserPlus },
  ]

  const handleFollow = async (userId) => {
    try {
      const { data } = await api.post('/api/user/follow', { id: userId }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
        dispatch(fetchUser(await getToken()))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post('/api/user/unfollow', { id: userId }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
        dispatch(fetchUser(await getToken()))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const acceptConnection = async (userId) => {
    try {
      const { data } = await api.post('/api/user/accept', { id: userId }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token))
    })
  }, [])

  const currentData = dataArray.find(item => item.label === currentTab)?.value || []
  const isFollowing = (userId) => currentUser?.followings?.some(id => id === userId)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connections</h1>
        <p className="text-gray-600">Manage your network and discover new connections</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4 overflow-x-auto">
          {dataArray.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => setCurrentTab(item.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  currentTab === item.label
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                {item.label}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {item.value?.length || 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData.length > 0 ? (
          currentData.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={user.profile_picture || 'https://via.placeholder.com/80'}
                  alt={user.full_name}
                  className="w-20 h-20 rounded-full object-cover mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                <p className="text-sm text-gray-500 mb-2">@{user.username}</p>

                {user.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {user.bio.length > 30 ? `${user.bio.slice(0, 30)}...` : user.bio}
                  </p>
                )}

                <div className="flex gap-2 w-full mt-4">
                  {currentTab === 'Followers' && (
                    <>
                      <button
                        onClick={() => navigate('/profile/' + user._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      >
                        <Eye size={16} />
                        Profile
                      </button>
                      <button
                        onClick={() => isFollowing(user._id) ? handleUnfollow(user._id) : handleFollow(user._id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing(user._id)
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {isFollowing(user._id) ? 'Unfollow' : 'Follow'}
                      </button>
                    </>
                  )}

                  {currentTab === 'Following' && (
                    <>
                      <button
                        onClick={() => navigate('/profile/' + user._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      >
                        <Eye size={16} />
                        Profile
                      </button>
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      >
                        Unfollow
                      </button>
                    </>
                  )}

                  {currentTab === 'Pending' && (
                    <>
                      <button
                        onClick={() => navigate('/profile/' + user._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      >
                        <Eye size={16} />
                        Profile
                      </button>
                      <button
                        onClick={() => acceptConnection(user._id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                      >
                        Accept
                      </button>
                    </>
                  )}

                  {currentTab === 'Connections' && (
                    <>
                      <button
                        onClick={() => navigate('/profile/' + user._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      >
                        <Eye size={16} />
                        Profile
                      </button>
                      <button
                        onClick={() => navigate('/messages/' + user._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                      >
                        <MessageSquare size={16} />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No {currentTab.toLowerCase()} found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Connections