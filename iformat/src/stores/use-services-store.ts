import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ServiceProduct } from "@/features/services/components/product-detail-modal";
import { SERVICES_DATA } from "@/features/services/data/services-data";

export interface ServiceProductWithStatus extends ServiceProduct {
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ServicesState {
  services: ServiceProductWithStatus[];
  isHydrated: boolean;

  // Actions
  setHydrated: (val: boolean) => void;
  addService: (service: Omit<ServiceProductWithStatus, "id"> & { id?: string }) => void;
  updateService: (id: string, updated: Partial<ServiceProductWithStatus>) => void;
  deleteService: (id: string) => void;
  toggleServiceStatus: (id: string) => void;
  resetToDefaults: () => void;
}

export const useServicesStore = create<ServicesState>()(
  persist(
    (set) => ({
      services: SERVICES_DATA.map((s) => ({
        ...s,
        isActive: true,
        createdAt: new Date().toISOString(),
      })),
      isHydrated: false,

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
          isActive: newService.isActive !== undefined ? newService.isActive : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          services: [created, ...state.services],
        }));
      },

      updateService: (id, updated) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id
              ? {
                  ...service,
                  ...updated,
                  updatedAt: new Date().toISOString(),
                }
              : service
          ),
        }));
      },

      deleteService: (id) => {
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        }));
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
      },

      resetToDefaults: () => {
        set({
          services: SERVICES_DATA.map((s) => ({
            ...s,
            isActive: true,
            createdAt: new Date().toISOString(),
          })),
        });
      },
    }),
    {
      name: "iformat-services-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
