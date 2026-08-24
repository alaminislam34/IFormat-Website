import { create } from "zustand";

interface JobFilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  page: number;
  limit: number;

  // Actions
  setSearchQuery: (search: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedLocation: (location: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useJobFilterStore = create<JobFilterState>((set) => ({
  searchQuery: "",
  selectedCategory: "All Industries",
  selectedLocation: "All",
  page: 1,
  limit: 12,

  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory, page: 1 }),
  setSelectedLocation: (selectedLocation) => set({ selectedLocation, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({
      searchQuery: "",
      selectedCategory: "All Industries",
      selectedLocation: "All",
      page: 1,
    }),
}));
