export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  strategyId: string;
  strategyName: string;
  strategyNumber: number;
  strategyPrice: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  duration: number;
  videoProgress: VideoProgress[];
  completedVideos: number;
  totalVideos: number;
  progressPercentage: number;
  currentVideoId?: string;
  previousStrategyId?: string;
  previousStrategyPrice?: number;
  amountPaid: number;
  renewalCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiredAt?: Date;
}

export interface VideoProgress {
  videoId: string;
  videoTitle: string;
  videoOrder: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface CreateSubscriptionDto {
  userId: string;
  strategyId: string;
  duration?: number;
  amountPaid?: number;
}

export interface RenewSubscriptionDto {
  duration?: number;
  newStrategyId?: string;
}

