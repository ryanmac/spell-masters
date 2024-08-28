// src/components/Layout.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser, User } from '@/contexts/UserContext'
import ProfileModal from './ProfileModal'
import { useRouter } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, setUser, logout } = useUser()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    router.push('/')
  }

  const handleEditProfile = () => {
    setIsModalOpen(true)
    setIsDropdownOpen(false)
  }

  const handleSaveProfile = (updatedProfile: User) => {
    setUser(updatedProfile)
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-start to-background-end text-foreground">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link href="/dashboard">Spell Masters</Link>
        </h1>
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="focus:outline-none"
            >
              <Image
                src={`/avatars/${user.avatar}`}
                alt={user.name}
                width={36}
                height={36}
                className="rounded-full m-0 p-0"
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleEditProfile}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>
      <main className="container mx-auto p-4">{children}</main>
      {user && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
          existingProfile={user}
        />
      )}
    </div>
  )
}

export default Layout