import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient } from "@/lib/api/api-client";

export interface LeaderMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface PartnerMember {
  id: string;
  name: string;
  position: string;
  company?: string;
  image: string;
  link?: string;
  bio?: string;
}

export interface VideoSettings {
  videoUrl: string;
  title: string;
  description: string;
}

export interface LeadersSettings {
  sectionTitle: string;
  sectionDescription: string;
  members: LeaderMember[];
}

export interface PartnersSettings {
  sectionTitle: string;
  sectionDescription: string;
  members: PartnerMember[];
}

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  videoUrl: "/videos/Event Promotion Video (2).mp4",
  title: "Experience the iFormat Vision",
  description:
    "Watch how our technology and psychological branding elevate executive careers & high-growth brands.",
};

export const DEFAULT_LEADERS_SETTINGS: LeadersSettings = {
  sectionTitle: "Meet the Leaders",
  sectionDescription:
    "Work with industry veterans who understand the nuances of modern hiring and personal branding.",
  members: [
    {
      id: "leader-1",
      name: "Jessica",
      role: "Founder",
      image: "/leaders/Jessica - Founder.png",
    },
    {
      id: "leader-2",
      name: "Maria",
      role: "CEO",
      image: "/leaders/Maria - CEO.png",
    },
    {
      id: "leader-3",
      name: "Priya",
      role: "Head of Career Coaching",
      image: "/leaders/Priya - Head of Career Coaching.png",
    },
    {
      id: "leader-4",
      name: "Ian Francis",
      role: "Chief Editor",
      image: "/leaders/Ian - Chief Editor.png",
    },
    {
      id: "leader-5",
      name: "Tarryn",
      role: "Head of Business Branding",
      image: "/leaders/Tarryn - Head of Business Branding.png",
    },
  ],
};

export const DEFAULT_PARTNERS_SETTINGS: PartnersSettings = {
  sectionTitle: "Strategic Partners",
  sectionDescription:
    "Collaborating with elite global talent networks, venture builders, and executive organizations.",
  members: [
    {
      id: "partner-1",
      name: "Marcus Sterling",
      position: "Managing Partner",
      company: "Apex Talent Ventures",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
      link: "https://linkedin.com",
    },
    {
      id: "partner-2",
      name: "Sophia Chen",
      position: "Head of Global Placement",
      company: "Silicon Talent Guild",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
      link: "https://linkedin.com",
    },
    {
      id: "partner-3",
      name: "David Montgomery",
      position: "Principal Career Architect",
      company: "Vanguard Executive",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
      link: "https://linkedin.com",
    },
    {
      id: "partner-4",
      name: "Elena Rostova",
      position: "Advisory Board Director",
      company: "Global Career Alliance",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
      link: "https://linkedin.com",
    },
    {
      id: "partner-5",
      name: "Kavita Rao",
      position: "Strategic Brand Consultant",
      company: "Aura Leadership Network",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
      link: "https://linkedin.com",
    },
  ],
};

interface LandingContentState {
  videoSettings: VideoSettings;
  leadersSettings: LeadersSettings;
  partnersSettings: PartnersSettings;
  isHydrated: boolean;
  isSaving: boolean;

  // Actions
  setHydrated: (val: boolean) => void;
  updateVideoSettings: (settings: Partial<VideoSettings>) => void;
  updateLeadersSettings: (settings: Partial<LeadersSettings>) => void;
  updatePartnersSettings: (settings: Partial<PartnersSettings>) => void;
  addLeader: (member: Omit<LeaderMember, "id"> & { id?: string }) => void;
  updateLeader: (id: string, member: Partial<LeaderMember>) => void;
  deleteLeader: (id: string) => void;
  addPartner: (partner: Omit<PartnerMember, "id"> & { id?: string }) => void;
  updatePartner: (id: string, partner: Partial<PartnerMember>) => void;
  deletePartner: (id: string) => void;
  resetVideoToDefault: () => void;
  resetLeadersToDefault: () => void;
  resetPartnersToDefault: () => void;
  syncWithBackend: () => Promise<void>;
  saveToBackend: () => Promise<void>;
}

export const useLandingContentStore = create<LandingContentState>()(
  persist(
    (set, get) => ({
      videoSettings: DEFAULT_VIDEO_SETTINGS,
      leadersSettings: DEFAULT_LEADERS_SETTINGS,
      partnersSettings: DEFAULT_PARTNERS_SETTINGS,
      isHydrated: false,
      isSaving: false,

      setHydrated: (val: boolean) => set({ isHydrated: val }),

      updateVideoSettings: (settings) => {
        set((state) => ({
          videoSettings: {
            ...state.videoSettings,
            ...settings,
          },
        }));
      },

      updateLeadersSettings: (settings) => {
        set((state) => ({
          leadersSettings: {
            ...state.leadersSettings,
            ...settings,
          },
        }));
      },

      updatePartnersSettings: (settings) => {
        set((state) => ({
          partnersSettings: {
            ...state.partnersSettings,
            ...settings,
          },
        }));
      },

      addLeader: (member) => {
        const id = member.id?.trim() || `leader-${Date.now()}`;
        set((state) => ({
          leadersSettings: {
            ...state.leadersSettings,
            members: [
              ...state.leadersSettings.members,
              {
                id,
                name: member.name,
                role: member.role,
                image: member.image,
              },
            ],
          },
        }));
      },

      updateLeader: (id, member) => {
        set((state) => ({
          leadersSettings: {
            ...state.leadersSettings,
            members: state.leadersSettings.members.map((m) =>
              m.id === id ? { ...m, ...member } : m
            ),
          },
        }));
      },

      deleteLeader: (id) => {
        set((state) => ({
          leadersSettings: {
            ...state.leadersSettings,
            members: state.leadersSettings.members.filter((m) => m.id !== id),
          },
        }));
      },

      addPartner: (partner) => {
        const id = partner.id?.trim() || `partner-${Date.now()}`;
        set((state) => ({
          partnersSettings: {
            ...state.partnersSettings,
            members: [
              ...state.partnersSettings.members,
              {
                id,
                name: partner.name,
                position: partner.position,
                company: partner.company,
                image: partner.image,
                link: partner.link,
                bio: partner.bio,
              },
            ],
          },
        }));
      },

      updatePartner: (id, partner) => {
        set((state) => ({
          partnersSettings: {
            ...state.partnersSettings,
            members: state.partnersSettings.members.map((p) =>
              p.id === id ? { ...p, ...partner } : p
            ),
          },
        }));
      },

      deletePartner: (id) => {
        set((state) => ({
          partnersSettings: {
            ...state.partnersSettings,
            members: state.partnersSettings.members.filter((p) => p.id !== id),
          },
        }));
      },

      resetVideoToDefault: () => {
        set({ videoSettings: DEFAULT_VIDEO_SETTINGS });
      },

      resetLeadersToDefault: () => {
        set({ leadersSettings: DEFAULT_LEADERS_SETTINGS });
      },

      resetPartnersToDefault: () => {
        set({ partnersSettings: DEFAULT_PARTNERS_SETTINGS });
      },

      syncWithBackend: async () => {
        try {
          const res = await apiClient.get<any>("/settings");
          const data = res?.data || res;
          if (data) {
            if (data.homepage_video) {
              const video =
                typeof data.homepage_video === "string"
                  ? JSON.parse(data.homepage_video)
                  : data.homepage_video;
              set({ videoSettings: video });
            }
            if (data.homepage_leaders) {
              const leaders =
                typeof data.homepage_leaders === "string"
                  ? JSON.parse(data.homepage_leaders)
                  : data.homepage_leaders;
              set({ leadersSettings: leaders });
            }
            if (data.homepage_partners) {
              const partners =
                typeof data.homepage_partners === "string"
                  ? JSON.parse(data.homepage_partners)
                  : data.homepage_partners;
              set({ partnersSettings: partners });
            }
          }
        } catch {
          // Fallback to localStorage gracefully
        }
      },

      saveToBackend: async () => {
        set({ isSaving: true });
        try {
          const { videoSettings, leadersSettings, partnersSettings } = get();
          await apiClient.patch("/settings", {
            homepage_video: JSON.stringify(videoSettings),
            homepage_leaders: JSON.stringify(leadersSettings),
            homepage_partners: JSON.stringify(partnersSettings),
          });
        } catch {
          // Saved to localStorage regardless
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: "iformat-landing-content-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
