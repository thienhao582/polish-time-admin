export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  applicableServices: string[]; // service IDs
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 'upcoming' | 'active' | 'expired';
