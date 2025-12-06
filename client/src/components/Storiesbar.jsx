import React, {useEffect, useState} from 'react'
import { Plus } from 'lucide-react'
import moment from 'moment'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Storiesbar = () => {
  const {getToken} = useAuth()
  const [stories, setStories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [viewStories, setViewStories] = useState(null)
  
  const fetchStories = async () => {
    try {
      const token = await getToken()
      const {data} = await api.get('/api/story/get', {
        headers: {Authorization: `Bearer ${token}`}
      })
      if(data.success){
        setStories(data.stories)
      }else{
        toast(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.user._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: []
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {});

  const storyGroups = Object.values(groupedStories);

  return (
    <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl overflow-x-auto no-scrollbar px-4'>
      <div className='flex flex-row gap-4 pb-5 whitespace-nowrap'>
        <div onClick={() => setShowModal(true)} className='rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-red-300 bg-gradient-to-b from-red-100 to-white'>
          <div className='h-full flex flex-col items-center justify-center p-4'>
            <div className='size-10 bg-red-400 rounded-full flex items-center justify-center mb-3'>
              <Plus className='w-5 h-5 text-white' />
            </div>
            <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
          </div>
        </div>
        
        {storyGroups.map((group, index) => {
          const latestStory = group.stories[0]; 
          return (
            <div onClick={() => setViewStories(group.stories)} key={index} className='relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-red-400 to-rose-600 hover:from-red-600 hover:to-rose-700 active:scale-95 inline-block'>
              <img src={group.user.profile_picture} alt='' className='absolute size-8 top-3 left-3 z-10 rounded-full ring-2 ring-white shadow' />
              {group.stories.length > 1 && (
                <div className='absolute top-3 right-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full'>
                  {group.stories.length}
                </div>
              )}
              
              <p className='absolute top-18 left-3 text-white/60 text-sm truncate max-w-24'>{latestStory.content}</p>
              <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>{moment(latestStory.createdAt).fromNow()}</p>
              
              {latestStory.media_type !== 'text' && (
                <div className='absolute inset-0 z-1 rounded-lg bg-black overflow-hidden'>
                  {latestStory.media_type === 'image' ? (
                    <img src={latestStory.media_url} alt='' className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' />
                  ) : (
                    <video src={latestStory.media_url} className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />}
      {viewStories && <StoryViewer viewStories={viewStories} setViewStories={setViewStories} />}
    </div>
  )
}

export default Storiesbar