// src/app/assessment/[levelId]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AssessmentMode from '@/components/AssessmentMode';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function AssessmentPage({ params }: { params: { levelId: string } }) {
  const searchParams = useSearchParams();
  const assessmentType = searchParams.get('type') as 'core' | 'bonus' | 'comprehensive' || 'core';
  const sublevel = searchParams.get('sublevel') || '1'; // Fetch the sublevel from URL parameters

  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else {
      // If there's no user after a short delay, redirect to profile
      const timer = setTimeout(() => {
        router.push('/');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (isLoading) {
    return <div className="text-center mt-8">Loading assessment...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Assessment Mode</h2>
      <AssessmentMode 
        levelId={params.levelId} 
        assessmentType={assessmentType as 'core' | 'comprehensive' | 'bonus'}
        sublevel={parseInt(sublevel)}
      />
    </div>
  );
}