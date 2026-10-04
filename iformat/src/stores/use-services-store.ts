import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ServiceProduct } from "@/features/services/components/product-detail-modal";
import { SERVICES_DATA } from "@/features/services/data/services-data";
import { apiClient } from "@/lib/api/api-client";

export interface ServiceProductWithStatus extends ServiceProduct {
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ServicesState {
  services: ServiceProductWithStatus[];
  isHydrated: boolean;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  setHydrated: (val: boolean) => void;
  addService: (service: Omit<ServiceProductWithStatus, "id"> & { id?: string }) => void;
  updateService: (id: string, updated: Partial<ServiceProductWithStatus>) => void;
  deleteService: (id: string) => void;
  toggleServiceStatus: (id: string) => void;
  resetToDefaults: () => void;
  syncWithBackend: () => Promise<void>;
  saveToBackend: () => Promise<void>;
}

const mapToCloudFront = (url?: string): string => {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) return "";
  return url.replace(
    /https:\/\/(?:ifromat-media-db\.s3[.-][^/]+|s3[.-][^/]+\/ifromat-media-db)/g,
    "https://d27emhc73cwv74.cloudfront.net"
  );
};

export const useServicesStore = create<ServicesState>()(
  persist(
    (set, get) => ({
      services: SERVICES_DATA.map((s) => ({
        ...s,
        image: mapToCloudFront(s.image),
        isActive: true,
        createdAt: new Date().toISOString(),
      })),
      isHydrated: false,
      isLoading: true,
      isSaving: false,

      setHydrated: (val: boolean) => set({ isHydrated: val }),

      addService: (newService) => {
        const id =
          newService.id?.trim() ||
          newService.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") ||
          `service-${Date.now()}`;

        const created: ServiceProductWithStatus = {
          ...newService,
          id,
          image: mapToCloudFront(newService.image),
          isActive: newService.isActive !== undefined ? newService.isActive : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          services: [created, ...state.services],
        }));
        get().saveToBackend();
      },

      updateService: (id, updated) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id
              ? {
                  ...service,
                  ...updated,
                  image: updated.image !== undefined ? mapToCloudFront(updated.image) : service.image,
                  updatedAt: new Date().toISOString(),
                }
              : service
          ),
        }));
        get().saveToBackend();
      },

      deleteService: (id) => {
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        }));
        get().saveToBackend();
      },

      toggleServiceStatus: (id) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id
              ? {
                  ...service,
                  isActive: service.isActive === undefined ? false : !service.isActive,
                  updatedAt: new Date().toISOString(),
                }
              : service
          ),
        }));
        get().saveToBackend();
      },

      resetToDefaults: () => {
        const resetServices = SERVICES_DATA.map((s) => ({
          ...s,
          image: mapToCloudFront(s.image),
          isActive: true,
          createdAt: new Date().toISOString(),
        }));
        set({ services: resetServices });
        get().saveToBackend();
      },

      syncWithBackend: async () => {
        try {
          set({ isLoading: true });
          const res = await apiClient.get<any>("/settings");
          const data = res?.data || res;
          if (data && data.homepage_services) {
            const remoteServices =
              typeof data.homepage_services === "string"
                ? JSON.parse(data.homepage_services)
                : data.homepage_services;
            if (Array.isArray(remoteServices) && remoteServices.length > 0) {
              const cleanedServices = remoteServices.map((s: any) => {
                const defaultItem = SERVICES_DATA.find((d) => d.id === s.id);
                const mappedImg = mapToCloudFront(s.image) || defaultItem?.image || "";
                return {
                  ...s,
                  image: mappedImg,
                };
              });
              set({ services: cleanedServices });
            }
          }
        } catch {
          // Fallback to localStorage gracefully
        } finally {
          set({ isLoading: false });
        }
      },

      saveToBackend: async () => {
        set({ isSaving: true });
        try {
          const { services } = get();
          await apiClient.patch("/settings", {
            homepage_services: JSON.stringify(services),
          });
        } catch {
          // Saved to localStorage regardless
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: "iformat-services-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.services)) {
          state.services = state.services.map((s) => {
            const defaultItem = SERVICES_DATA.find((d) => d.id === s.id);
            let updatedImage = mapToCloudFront(s.image);
            if (!updatedImage && defaultItem?.image) {
              updatedImage = defaultItem.image;
            }
            const finalImage = updatedImage || defaultItem?.image || "";

            if (s.id === "personal-brand-builder" || s.title === "Personal Brand Builder") {
              return {
                ...s,
                id: "brand-equity-builder",
                title: "Brand Equity Builder",
                image: finalImage,
              };
            }
            if (s.id === "strategic-branding" || s.title === "Strategic Corporate & Founder Branding") {
              return {
                ...s,
                id: "executive-strategic-cv-linkedin",
                title: "Executive Strategic CV and Linkedin",
                image: finalImage,
              };
            }
            if (s.id === "career-hosting-package" || s.title === "Career Hosting & Portfolio Package") {
              return {
                ...s,
                id: "career-hunting-readiness",
                title: "Career Hunting Readiness",
                category: "Career Acceleration",
                image: finalImage,
              };
            }
            return {
              ...s,
              image: finalImage,
            };
          });
        }
        state?.setHydrated(true);
      },
    }
  )
);
