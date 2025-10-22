import React from 'react'
import { assets } from '../assets/assets'

const App = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
        <img src={assets.bgImage} alt="" className='absolute top-0 left-0 -z-1 w-full h-full object-cover'/>
    </div>
  )
}

export default App