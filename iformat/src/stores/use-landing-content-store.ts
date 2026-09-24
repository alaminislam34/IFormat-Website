import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient } from "@/lib/api/api-client";

export interface LeaderMember {
  id: string;
  name: string;
  role: string;
  image: string;
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

interface LandingContentState {
  videoSettings: VideoSettings;
  leadersSettings: LeadersSettings;
  isHydrated: boolean;
  isSaving: boolean;

  // Actions
  setHydrated: (val: boolean) => void;
  updateVideoSettings: (settings: Partial<VideoSettings>) => void;
  updateLeadersSettings: (settings: Partial<LeadersSettings>) => void;
  addLeader: (member: Omit<LeaderMember, "id"> & { id?: string }) => void;
  updateLeader: (id: string, member: Partial<LeaderMember>) => void;
  deleteLeader: (id: string) => void;
  resetVideoToDefault: () => void;
  resetLeadersToDefault: () => void;
  syncWithBackend: () => Promise<void>;
  saveToBackend: () => Promise<void>;
}

export const useLandingContentStore = create<LandingContentState>()(
  persist(
    (set, get) => ({
      videoSettings: DEFAULT_VIDEO_SETTINGS,
      leadersSettings: DEFAULT_LEADERS_SETTINGS,
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

      resetVideoToDefault: () => {
        set({ videoSettings: DEFAULT_VIDEO_SETTINGS });
      },

      resetLeadersToDefault: () => {
        set({ leadersSettings: DEFAULT_LEADERS_SETTINGS });
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
          }
        } catch {
          // Fallback to localStorage gracefully
        }
      },

      saveToBackend: async () => {
        set({ isSaving: true });
        try {
          const { videoSettings, leadersSettings } = get();
          await apiClient.patch("/settings", {
            homepage_video: JSON.stringify(videoSettings),
            homepage_leaders: JSON.stringify(leadersSettings),
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
