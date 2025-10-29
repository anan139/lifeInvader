import React, { useEffect, useState } from 'react'
import { dummyPostsData, assets } from '../assets/assets'
import Loading from '../components/Loading'
import Storiesbar from '../components/Storiesbar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'

const Feed = () => {
  const [feeds, setfeeds] = useState([])
  const [loading, setloading] = useState(true)

  const fetchFeeds = async () => {
    setfeeds(dummyPostsData)
    setloading(false)
  }

  useEffect(() =>{
    fetchFeeds()
  },[])

  return !loading ? (
    <div className='h-full overflow-y-auto no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      <div>
        <Storiesbar/>
        <div className='p-4 space-y-6'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2'>
          <h3 className='text-slate-800 font-semibold'>sponsored</h3>
          <img src={assets.sponsored_img} className='w-full h-40 object-cover rounded-md' alt="" />
          <p className='text-slate-600'>Email marketing</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
        </div>
        
          <RecentMessages/>
        
      </div>
     
    </div>
  ) : <Loading/>
}

export default Feed