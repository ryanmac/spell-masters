// src/components/ProfileSelection.tsx
'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, User } from '@/contexts/UserContext'
import Image from 'next/image'
import ProfileModal from './ProfileModal'
import { motion } from 'framer-motion'

const ProfileSelection: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<User | undefined>(undefined)
  const router = useRouter()
  const { setUser, updateUserProgress, removeUser, getAllUsers } = useUser()

  const users = useMemo(() => getAllUsers(), [getAllUsers])

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
      removeUser(profileToDelete.name);
      setIsModalOpen(false);
      setEditingProfile(undefined);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {users.length > 0 ? (
          <div className="flex justify-between items-center mb-0">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="p-2 bg-gray-800 text-black rounded hover:bg-yellow-600 transition-colors duration-300 ml-auto focus:outline-none focus:ring-2 focus:ring-yellow-300"
              aria-label={isEditMode ? "Finish editing" : "Edit profiles"}
            >
              {isEditMode ? 'Done' : 'Edit'}
            </button>
          </div>
        ) : null}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-2"
        >
          Welcome to Spell Masters
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-center mb-20"
        >
          Master your spelling skills in a fun and engaging way!
        </motion.p>
        
        {users.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <p className="mb-4">Get started by creating your first profile:</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              aria-label="Create new profile"
            >
              Create Profile
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-20">
              {users.map((profile: User, index: number) => (
                <motion.div
                  key={index}
                  className="cursor-pointer text-center relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    onClick={() => handleSelectProfile(profile)}
                    className="relative w-32 h-32 mx-auto mb-2 flex items-center justify-center"
                    tabIndex={0}
                    role="button"
                    aria-label={`Select profile: ${profile.name}`}
                    onKeyPress={(e) => e.key === 'Enter' && handleSelectProfile(profile)}
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
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Delete profile: ${profile.name}`}
                    >
                      X
                    </button>
                  )}
                </motion.div>
              ))}
              <motion.div
                onClick={() => {
                  setEditingProfile(undefined)
                  setIsModalOpen(true)
                }}
                className="cursor-pointer text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-32 h-32 mx-auto mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors duration-300">
                    <span className="text-5xl text-black">+</span>
                  </div>
                </div>
                <p className="font-semibold">Add Profile</p>
              </motion.div>
            </div>
          </>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
        <p className="text-sm text-gray-500">Spell Masters is an open source project to teach spelling.</p>
        <p className="text-sm text-gray-500">All information is stored locally in your browser and never shared.</p>
      </div>
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProfile(undefined)
        }}
        onSave={handleSaveProfile}
        onDelete={handleDeleteProfile}
        existingProfile={editingProfile}
      />
    </div>
  )
}

export default ProfileSelection