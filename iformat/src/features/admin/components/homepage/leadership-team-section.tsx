"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, RotateCcw, Edit2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useLandingContentStore,
  LeaderMember,
  DEFAULT_LEADERS_SETTINGS,
} from "@/stores/use-landing-content-store";
import { LeaderEditorModal } from "./leader-editor-modal";

export function LeadershipTeamSection() {
  const {
    leadersSettings,
    updateLeadersSettings,
    addLeader,
    updateLeader,
    deleteLeader,
    resetLeadersToDefault,
    saveToBackend,
    isSaving,
    isHydrated,
  } = useLandingContentStore();

  const [sectionTitle, setSectionTitle] = useState(leadersSettings.sectionTitle);
  const [sectionDescription, setSectionDescription] = useState(leadersSettings.sectionDescription);
  const [editingLeader, setEditingLeader] = useState<LeaderMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      setSectionTitle(leadersSettings.sectionTitle);
      setSectionDescription(leadersSettings.sectionDescription);
    }
  }, [isHydrated, leadersSettings]);

  const handleSaveHeaders = async (e: React.FormEvent) => {
    e.preventDefault();
    updateLeadersSettings({
      sectionTitle: sectionTitle.trim(),
      sectionDescription: sectionDescription.trim(),
    });
    await saveToBackend();
    toast.success("Leadership section text updated successfully!");
  };

  const handleReset = () => {
    resetLeadersToDefault();
    setSectionTitle(DEFAULT_LEADERS_SETTINGS.sectionTitle);
    setSectionDescription(DEFAULT_LEADERS_SETTINGS.sectionDescription);
    toast.info("Leadership team reset to default.");
  };

  const handleSaveLeader = (data: { name: string; role: string; image: string }) => {
    if (editingLeader) {
      updateLeader(editingLeader.id, data);
      toast.success("Leader updated successfully!");
    } else {
      addLeader(data);
      toast.success("New leader added to team!");
    }
    saveToBackend();
  };

  const handleDeleteLeader = (leader: LeaderMember) => {
    if (confirm(`Remove ${leader.name} from leadership team?`)) {
      deleteLeader(leader.id);
      saveToBackend();
      toast.success(`${leader.name} removed.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Headers Configuration */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Leadership Section Titles
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure heading and description displayed on the landing page.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-600 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>
        </div>

        <form onSubmit={handleSaveHeaders} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="MEET OUR EXPERTS"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Section Description
            </label>
            <input
              type="text"
              required
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              placeholder="It is our privilege to introduce the talented individuals..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-semibold px-5 cursor-pointer"
            >
              Save Section Header
            </Button>
          </div>
        </form>
      </div>

      {/* Leaders List & Cards */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Leadership Profiles ({leadersSettings.members.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage the photos, names, and titles of the leadership team members.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEditingLeader(null);
              setIsModalOpen(true);
            }}
            className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leader</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {leadersSettings.members.map((leader) => (
            <div
              key={leader.id}
              className="group relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-3/4 w-full bg-slate-200 overflow-hidden">
                {leader.image ? (
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                    <Users className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-black/20 to-transparent" />

                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingLeader(leader);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                    title="Edit Leader"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteLeader(leader)}
                    className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    title="Delete Leader"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                  <h4 className="font-bold text-sm leading-tight drop-shadow-xs truncate">
                    {leader.name}
                  </h4>
                  <p className="text-[11px] font-semibold text-cyan-300 drop-shadow-xs truncate mt-0.5">
                    {leader.role}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setEditingLeader(leader);
                    setIsModalOpen(true);
                  }}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLeader(leader)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LeaderEditorModal
        isOpen={isModalOpen}
        editingLeader={editingLeader}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLeader(null);
        }}
        onSave={handleSaveLeader}
      />
    </div>
  );
}
