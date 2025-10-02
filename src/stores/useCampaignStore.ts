import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign, CampaignStatus } from './types/campaign';
import { format } from 'date-fns';

interface CampaignState {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Campaign;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
  getCampaignById: (id: string) => Campaign | undefined;
  getCampaignStatus: (campaign: Campaign) => CampaignStatus;
  getActiveCampaigns: () => Campaign[];
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],

      addCampaign: (campaignData) => {
        const newCampaign: Campaign = {
          ...campaignData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          campaigns: [...state.campaigns, newCampaign],
        }));

        return newCampaign;
      },

      updateCampaign: (id, campaignData) => {
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id
              ? { ...campaign, ...campaignData, updatedAt: new Date().toISOString() }
              : campaign
          ),
        }));
      },

      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
        }));
      },

      toggleCampaignStatus: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id
              ? { ...campaign, isActive: !campaign.isActive, updatedAt: new Date().toISOString() }
              : campaign
          ),
        }));
      },

      getCampaignById: (id) => {
        return get().campaigns.find((campaign) => campaign.id === id);
      },

      getCampaignStatus: (campaign) => {
        const today = new Date();
        const startDate = new Date(campaign.startDate);
        const endDate = new Date(campaign.endDate);

        if (today < startDate) {
          return 'upcoming';
        } else if (today >= startDate && today <= endDate) {
          return 'active';
        } else {
          return 'expired';
        }
      },

      getActiveCampaigns: () => {
        const today = new Date();
        return get().campaigns.filter((campaign) => {
          const startDate = new Date(campaign.startDate);
          const endDate = new Date(campaign.endDate);
          return campaign.isActive && today >= startDate && today <= endDate;
        });
      },
    }),
    {
      name: 'campaign-storage',
    }
  )
);
