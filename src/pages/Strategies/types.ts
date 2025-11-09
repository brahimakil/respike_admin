export interface Strategy {
  id: string;
  number: number; // Strategy 1, 2, 3, etc.
  name: string;
  description: string;
  price: number;
  tags: string[];
  coverPhotoUrl?: string; // Cover photo URL
  expectedWeeks?: number; // Expected duration in weeks
  videoCount?: number; // Number of videos (calculated)
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyVideo {
  id: string;
  strategyId: string;
  order: number; // Video ordering (1, 2, 3, etc.)
  title: string;
  description: string;
  videoUrl: string;
  bunnyVideoId?: string; // Bunny.net video ID for graceful fallback
  coverPhotoUrl?: string;
  isVisible: boolean; // Show/hide video
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStrategyDto {
  name: string;
  description: string;
  price: number;
  tags: string[];
  expectedWeeks?: number;
}

export interface UpdateStrategyDto {
  number?: number;
  name?: string;
  description?: string;
  price?: number;
  tags?: string[];
  coverPhotoUrl?: string;
  expectedWeeks?: number;
}

export interface CreateVideoDto {
  title: string;
  description: string;
  videoUrl?: string;
  coverPhotoUrl?: string;
}

export interface UpdateVideoDto {
  order?: number;
  title?: string;
  description?: string;
  videoUrl?: string;
  coverPhotoUrl?: string;
  isVisible?: boolean;
}
