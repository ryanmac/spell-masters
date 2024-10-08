// src/components/ProfileModal.tsx
import React, { useState, useEffect } from 'react'
import { User } from '@/contexts/UserContext'
import Image from 'next/image'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profile: User) => void
  onDelete: (profile: User) => void
  existingProfile?: User
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, onDelete, existingProfile }) => {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(1)
  const [avatar, setAvatar] = useState('1.png')
  const [avatarPage, setAvatarPage] = useState(0)
  const [randomizedAvatars, setRandomizedAvatars] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const totalAvatars = 99
  const avatarsPerPage = 9
  const totalPages = Math.ceil(totalAvatars / avatarsPerPage)

  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name)
      setGrade(existingProfile.grade)
      setAvatar(existingProfile.avatar)
    } else {
      setName('')
      setGrade(1)
      setAvatar('1.png')
    }
    setIsDeleting(false)
    setDeleteConfirmation('')
  }, [existingProfile, isOpen])

  useEffect(() => {
    // Randomize the avatars only once when the modal opens
    if (isOpen) {
      const allAvatars = Array.from({ length: 99 }, (_, i) => i + 1)

      for (let i = allAvatars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[allAvatars[i], allAvatars[j]] = [allAvatars[j], allAvatars[i]]
      }

      setRandomizedAvatars(allAvatars)
      // Ensure that the avatar is set to the existing profile's avatar or the first randomized avatar
      setAvatar(existingProfile?.avatar || `${allAvatars[0]}.png`)
    }
  }, [isOpen, existingProfile])

  const handleSave = () => {
    const profile: User = {
      ...(existingProfile || {}),
      name,
      grade,
      avatar,
      uniqueWordsMastered: existingProfile?.uniqueWordsMastered || 0,
      totalStars: existingProfile?.totalStars || 0,
      accuracyRate: existingProfile?.accuracyRate || 0,
      averageTimePerWord: existingProfile?.averageTimePerWord || 0,
      challengingWords: existingProfile?.challengingWords || [],
      bonusProgress: existingProfile?.bonusProgress || {},
      comprehensiveEvaluations: existingProfile?.comprehensiveEvaluations || [],
      levelProgress: existingProfile?.levelProgress || {},
      completedCore: existingProfile?.completedCore || 0,
      completedBonus: existingProfile?.completedBonus || 0,
      totalWordsAttempted: existingProfile?.totalWordsAttempted || 0,
      totalCorrectAttempts: existingProfile?.totalCorrectAttempts || 0,
      typingMode: existingProfile?.typingMode || false,
    }
    onSave(profile)
  }

  const renderAvatars = () => {
    const startIndex = avatarPage * avatarsPerPage
    const endIndex = Math.min(startIndex + avatarsPerPage, totalAvatars)
    
    return randomizedAvatars.slice(startIndex, endIndex).map((num) => (
      <div
        key={num}
        onClick={() => setAvatar(`${num}.png`)}
        className={`cursor-pointer p-1 ${avatar === `${num}.png` ? 'border-2 border-yellow-500' : ''}`}
      >
        <Image src={`/avatars/${num}.png`} alt={`Avatar ${num}`} width={100} height={100} className="rounded-full" />
      </div>
    ))
  }

  const handleDeleteClick = () => {
    setIsDeleting(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmation === name && existingProfile) {
      onDelete(existingProfile)
      onClose()
    }
  }

  const renderDeleteSection = () => {
    if (!existingProfile) return null

    if (!isDeleting) {
      return (
        <button
          onClick={handleDeleteClick}
          className="mt-8 p-2 border-red-500 text-white rounded hover:border-red-600 hover:text-white-800 w-full"
        >
          Delete Profile
        </button>
      )
    }

    return (
      <div className="mt-4 p-4 bg-red-500 rounded">
        <p className="text-white-600 mb-2">We&apos;re sorry to see you go!</p>
        <p className="text-sm text-gray-100 mb-4">
          Remember, none of your data ever leaves your device. There&apos;s no tracking of any kind.
        </p>
        <p className="mb-2">To confirm deletion, please type the profile name: <strong>{name}</strong></p>
        <input
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          placeholder="Type profile name to confirm"
          className="w-full p-2 mb-2 bg-white text-black rounded border border-red-500"
        />
        <button
          onClick={handleDeleteConfirm}
          disabled={deleteConfirmation !== name}
          className="p-2 bg-red-700 text-white rounded hover:bg-red-600 w-full disabled:bg-red-300"
        >
          Confirm Deletion
        </button>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{existingProfile ? 'Edit Profile' : 'Create Profile'}</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter profile name"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
        />
        <select
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
        >
          {[...Array(13)].map((_, i) => (
            <option key={i} value={i + 1}>
              {i === 12 ? 'College' : `Grade ${i + 1}`}
            </option>
          ))}
        </select>
        <div className="mb-4">
          <p className="mb-2">Select Avatar:</p>
          <div className="grid grid-cols-3 gap-2 mb-2">{renderAvatars()}</div>
          <div className="flex justify-between">
            <button
              onClick={() => setAvatarPage((prev) => Math.max(0, prev - 1))}
              disabled={avatarPage === 0}
              className="p-1 rounded disabled:bg-gray-500"
            >
              ◄
            </button>
            <span>{avatarPage + 1} / {totalPages}</span>
            <button
              onClick={() => setAvatarPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={avatarPage === totalPages - 1}
              className="p-1 rounded disabled:bg-gray-500"
            >
              ►
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <button onClick={onClose} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
            Cancel
          </button>
          <button onClick={handleSave} className="p-2 bg-yellow-500 text-black rounded hover:bg-yellow-600">
            Save
          </button>
        </div>
        {/* {renderDeleteSection()} */}
      </div>
    </div>
  )
}

export default ProfileModal