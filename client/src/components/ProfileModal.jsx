import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets'
import { Pencil } from 'lucide-react'

const ProfileModal = ({ setShowEdit }) => {
  const user = dummyUserData
  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
  })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    console.log('Saving profile:', editForm)
  }

  const handleFileChange = (field, file) => {
    setEditForm({ ...editForm, [field]: file })
  }

  return (
    <div className='fixed inset-0 z-50 h-screen overflow-y-auto bg-black/50 flex items-start justify-center p-4'>
      <div className='max-w-2xl w-full my-8'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>
          <form className='space-y-4' onSubmit={handleSaveProfile}>
            
            <div className='flex flex-col items-start gap-3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Profile Picture
              </label>
              <input 
                hidden 
                type='file' 
                accept='image/*' 
                id='profile_picture' 
                onChange={e => handleFileChange('profile_picture', e.target.files[0])} 
              />
              <label 
                htmlFor='profile_picture' 
                className='group/profile relative cursor-pointer'
              >
                <img 
                  src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : user.profile_picture} 
                  alt='Profile' 
                  className='w-24 h-24 rounded-full object-cover mt-2 border-2 border-gray-200' 
                />
                <div className='absolute inset-0 hidden group-hover/profile:flex bg-black/20 rounded-full items-center justify-center transition-all'>
                  <Pencil className='w-5 h-5 text-white' />
                </div>
              </label>
            </div>

            <div className='flex flex-col items-start gap-3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Cover Photo
              </label>
              <input 
                hidden 
                type='file' 
                accept='image/*' 
                id='cover_photo' 
                onChange={e => handleFileChange('cover_photo', e.target.files[0])} 
              />
              <label 
                htmlFor='cover_photo' 
                className='group/cover relative cursor-pointer'
              >
                <img 
                  src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : user.cover_photo} 
                  alt='Cover' 
                  className='w-full h-40 rounded-lg bg-gradient-to-r from-red-300 via-rose-200 to-rose-300 object-cover mt-2' 
                />
                <div className='absolute inset-0 hidden group-hover/cover:flex bg-black/20 rounded-lg items-center justify-center transition-all'>
                  <Pencil className='w-5 h-5 text-white' />
                </div>
              </label>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
              <input 
                type='text' 
                className='w-full p-3 border border-gray-200 rounded-lg focus:border-red-400 focus:ring-1 focus:ring-red-500' 
                placeholder='Please enter your full name' 
                onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} 
                value={editForm.full_name} 
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
              <input 
                type='text' 
                className='w-full p-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                placeholder='Please enter your username' 
                onChange={e => setEditForm({ ...editForm, username: e.target.value })} 
                value={editForm.username} 
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
              <textarea 
                rows={3} 
                className='w-full p-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                placeholder='Please enter a short bio' 
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })} 
                value={editForm.bio} 
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
              <input 
                type='text' 
                className='w-full p-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                placeholder='Please enter your location' 
                onChange={e => setEditForm({ ...editForm, location: e.target.value })} 
                value={editForm.location} 
              />
            </div>
            <div className='flex justify-end space-x-3 pt-6'>
              <button 
                onClick={() => setShowEdit(false)} 
                type='button' 
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'
              >
                Cancel
              </button>
              <button 
                type='submit' 
                className='px-4 py-2 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-lg hover:from-red-500 hover:to-rose-700 transition cursor-pointer'
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal