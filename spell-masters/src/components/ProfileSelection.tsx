// src/components/ProfileSelection.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, User } from '@/contexts/UserContext'
import Image from 'next/image'
import ProfileModal from './ProfileModal'

const ProfileSelection: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<User | undefined>(undefined)
  const router = useRouter()
  const { setUser, updateUserProgress, removeUser, getAllUsers } = useUser()

  const users = getAllUsers()

  const handleSelectProfile = (profile: User) => {
    if (isEditMode) {
      setEditingProfile(profile)
      setIsModalOpen(true)
    } else {
      setUser(profile)
      router.push('/dashboard')
    }
  }

  const handleSaveProfile = (savedProfile: User) => {
    if (editingProfile) {
      updateUserProgress(savedProfile)
    } else {
      setUser(savedProfile)
    }
    setIsModalOpen(false)
    setEditingProfile(undefined)
  }

  const handleDeleteProfile = (profileToDelete: User) => {
    if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      removeUser(profileToDelete.name)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="p-2 bg-gray-500 text-black rounded hover:bg-yellow-600 ml-auto"
          >
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map((profile: User, index: number) => (
            <div
              key={index}
              className="cursor-pointer text-center relative"
            >
              <div
                onClick={() => handleSelectProfile(profile)}
                className="relative w-32 h-32 mx-auto mb-2 flex items-center justify-center"
              >
                <Image
                  src={`/avatars/${profile.avatar}`}
                  alt={profile.name}
                  fill={true}
                  sizes={"100%"}
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <p className="font-semibold text-center">{profile.name}</p>
              {isEditMode && (
                <button
                  onClick={() => handleDeleteProfile(profile)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  X
                </button>
              )}
            </div>
          ))}
          <div
            onClick={() => {
              setEditingProfile(undefined)
              setIsModalOpen(true)
            }}
            className="cursor-pointer text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-2 flex items-center justify-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-5xl text-black">+</span>
              </div>
            </div>
            <p className="font-semibold"></p>
          </div>
        </div>
      </div>
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProfile(undefined)
        }}
        onSave={handleSaveProfile}
        existingProfile={editingProfile}
      />
    </div>
  )
}

export default ProfileSelection