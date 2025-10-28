import React, { useEffect, useState } from 'react'
import { dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import Storiesbar from '../components/Storiesbar'
import PostCard from '../components/PostCard'

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
          {feeds.map((post)=(<PostCard key={post._id} post={post}/>))}
          {feeds.map((post, idx) => (
            <div key={post._id || idx} className="bg-white rounded-lg shadow p-4">
              <div className="font-bold mb-2">{post.user?.full_name || 'Unknown User'}</div>
              <div className="mb-2">{post.content}</div>
              {post.image_urls && post.image_urls.length > 0 && (
                <img src={post.image_urls[0]} alt="post" className="w-full max-w-xs rounded" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className='max-xl:hidde sticky top-0'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 show'>
          <h3 className='text-slate-800 front-semibold'>sponsored</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="" />
          <p className='text-slate-600'>Email marketing</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerful, easy-to-use platform built foe result.</p>
        </div>
        
          <h1>recent msg</h1>
        
      </div>
     
    </div>
  ) : <Loading/>
}

export default Feed