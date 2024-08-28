// src/utils/spacedRepetition.ts
import { User, Review } from '@/contexts/UserContext'

const REVIEW_INTERVALS = [1, 3, 7, 14, 30] // Days

export function scheduleWordForReview(user: User, word: string): User {
  const now = new Date()
  const reviewDate = new Date(now.setDate(now.getDate() + REVIEW_INTERVALS[0]))

  const updatedUser: User = {
    ...user,
    scheduledReviews: [
      ...(user.scheduledReviews ?? []), // Ensure it's an array
      { word, reviewDate: reviewDate.toISOString() }
    ]
  }

  return updatedUser
}

export function getWordsForReview(user: User): string[] {
  const now = new Date()
  return (user.scheduledReviews ?? []) // Ensure it's an array
    .filter((review: Review) => new Date(review.reviewDate) <= now)
    .map((review: Review) => review.word)
}

export function updateReviewSchedule(user: User, word: string, wasCorrect: boolean): User {
  const scheduledReviews = user.scheduledReviews ?? []; // Ensure it's an array

  const reviewIndex = scheduledReviews.findIndex(
    (review: Review) => review.word === word
  );

  if (reviewIndex === -1) {
    return user;
  }

  const currentInterval = REVIEW_INTERVALS.indexOf(
    Math.floor(
      (new Date().getTime() - new Date(scheduledReviews[reviewIndex].reviewDate).getTime()) /
      (1000 * 60 * 60 * 24)
    )
  );

  const nextIntervalIndex = wasCorrect 
    ? Math.min(currentInterval + 1, REVIEW_INTERVALS.length - 1) 
    : Math.max(currentInterval - 1, 0);

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + REVIEW_INTERVALS[nextIntervalIndex]);

  const updatedReviews = [...scheduledReviews];
  updatedReviews[reviewIndex] = { ...updatedReviews[reviewIndex], reviewDate: nextReviewDate.toISOString() };

  return { ...user, scheduledReviews: updatedReviews };
}