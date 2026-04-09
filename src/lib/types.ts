export interface User {
  id: string;
  name: string;
  phone: string;
  location: string;
  role: 'user' | 'helper';
  rating: number;
  isVerified: boolean;
  aadhaarNumber?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  creatorId: string;
  creatorName: string;
  creatorPhone: string;
  creatorVerified: boolean;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt?: number;
  cancelledAt?: number;
  scheduledDate?: string;
}

export interface Offer {
  id: string;
  jobId: string;
  helperId: string;
  helperName: string;
  helperPhone: string;
  helperVerified: boolean;
  message: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt?: number;
  updatedAt?: number;
  cancelledAt?: number;
}

export interface Review {
  id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: number;
}
