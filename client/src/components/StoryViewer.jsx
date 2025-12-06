import { BadgeCheck, X, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

const StoryViewer = ({ viewStories, setViewStories }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  
  const viewStory = viewStories?.[currentIndex]

  const handleClose = useCallback(() => {
    setViewStories(null)
    setCurrentIndex(0)
  }, [setViewStories])

  const handleNext = useCallback(() => {
    if (currentIndex < viewStories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else {
      handleClose()
    }
  }, [currentIndex, viewStories.length, handleClose])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    }
  }, [currentIndex])

  useEffect(() => {
    let timer, progressInterval
    if (viewStory && viewStory.media_type !== 'video') {
      setProgress(0)
      const duration = 10000
      const setTime = 100
      let elapsed = 0
      progressInterval = setInterval(() => {
        elapsed += setTime
        setProgress((elapsed / duration) * 100)
      }, setTime)
      timer = setTimeout(() => { 
        handleNext()
      }, duration)
    }
    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [viewStory, currentIndex, handleNext])

  if (!viewStory) return null

  const renderContent = () => {
    switch (viewStory.media_type) {
      case 'image':
        return (
          <img src={viewStory.media_url} alt='' className='max-w-full max-h-screen object-contain' />
        )
      case 'video':
        return (
          <video onEnded={handleNext} src={viewStory.media_url} className='max-h-screen' controls autoPlay />
        )
      case 'text':
        return (
          <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center'>
            {viewStory.content}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='fixed inset-0 h-screen bg-opacity-90 z-110 flex items-center justify-center' style={{ backgroundColor: viewStory.media_type === 'text' ? viewStory.background_color : '#000000' }}>
      <div className='absolute top-0 left-0 w-full h-1 flex gap-1 px-2'>
        {viewStories.map((_, index) => (
          <div key={index} className='flex-1 h-full bg-gray-700 rounded'>
            <div 
              className='h-full bg-white transition-all duration-100 linear rounded' 
              style={{ width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' }}
            ></div>
          </div>
        ))}
      </div>

      <div className='absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50'>
        <img src={viewStory.user?.profile_picture} alt='' className='size-7 sm:size-8 rounded-full object-cover border border-white' />
        <div className='flex items-center gap-2'>
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      <button onClick={handleClose} className='absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none'>
        <X className='w-8 h-8 hover:scale-110 transition cursor-pointer' />
      </button>

      {currentIndex > 0 && (
        <button onClick={handlePrev} className='absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition'>
          <ChevronLeft className='w-8 h-8' />
        </button>
      )}
      {currentIndex < viewStories.length - 1 && (
        <button onClick={handleNext} className='absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition'>
          <ChevronRight className='w-8 h-8' />
        </button>
      )}

      <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
        {renderContent()}
      </div>
    </div>
  )
}

export default StoryViewer