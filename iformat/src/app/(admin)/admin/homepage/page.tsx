"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
  Users,
  Handshake,
  Upload,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  Save,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  X,
  Loader2,
  FileVideo,
  ImageIcon,
  Building2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import {
  useLandingContentStore,
  LeaderMember,
  PartnerMember,
  DEFAULT_VIDEO_SETTINGS,
  DEFAULT_LEADERS_SETTINGS,
  DEFAULT_PARTNERS_SETTINGS,
} from "@/stores/use-landing-content-store";
import { apiClient } from "@/lib/api/api-client";
import { toast } from "sonner";

export default function AdminHomepageContentPage() {
  const {
    videoSettings,
    leadersSettings,
    partnersSettings,
    updateVideoSettings,
    updateLeadersSettings,
    updatePartnersSettings,
    addLeader,
    updateLeader,
    deleteLeader,
    addPartner,
    updatePartner,
    deletePartner,
    resetVideoToDefault,
    resetLeadersToDefault,
    resetPartnersToDefault,
    syncWithBackend,
    saveToBackend,
    isSaving,
    isHydrated,
  } = useLandingContentStore();

  const [activeTab, setActiveTab] = useState<"video" | "leaders" | "partners">("video");

  // Local Form States for Video
  const [videoUrl, setVideoUrl] = useState(videoSettings.videoUrl);
  const [videoTitle, setVideoTitle] = useState(videoSettings.title);
  const [videoDescription, setVideoDescription] = useState(videoSettings.description);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Local Form States for Leaders Section
  const [leadersSectionTitle, setLeadersSectionTitle] = useState(leadersSettings.sectionTitle);
  const [leadersSectionDescription, setLeadersSectionDescription] = useState(leadersSettings.sectionDescription);
  const [editingLeader, setEditingLeader] = useState<LeaderMember | null>(null);
  const [isAddingLeader, setIsAddingLeader] = useState(false);
  const [isUploadingLeaderImage, setIsUploadingLeaderImage] = useState(false);
  const [leaderFormData, setLeaderFormData] = useState({
    name: "",
    role: "",
    image: "",
  });
  const leaderImageInputRef = useRef<HTMLInputElement>(null);

  // Local Form States for Partners Section
  const [partnersSectionTitle, setPartnersSectionTitle] = useState(partnersSettings.sectionTitle);
  const [partnersSectionDescription, setPartnersSectionDescription] = useState(partnersSettings.sectionDescription);
  const [editingPartner, setEditingPartner] = useState<PartnerMember | null>(null);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [isUploadingPartnerImage, setIsUploadingPartnerImage] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState({
    name: "",
    position: "",
    company: "",
    image: "",
    link: "",
    bio: "",
  });
  const partnerImageInputRef = useRef<HTMLInputElement>(null);

  // Sync on initial mount
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Sync local form states when store hydrates
  useEffect(() => {
    if (isHydrated) {
      setVideoUrl(videoSettings.videoUrl);
      setVideoTitle(videoSettings.title);
      setVideoDescription(videoSettings.description);

      setLeadersSectionTitle(leadersSettings.sectionTitle);
      setLeadersSectionDescription(leadersSettings.sectionDescription);

      setPartnersSectionTitle(partnersSettings.sectionTitle);
      setPartnersSectionDescription(partnersSettings.sectionDescription);
    }
  }, [isHydrated, videoSettings, leadersSettings, partnersSettings]);

  // Handle Video File Upload
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid MP4 or WebM video file.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size cannot exceed 50 MB.");
      return;
    }

    try {
      setIsUploadingVideo(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post<any>("/upload/media", formData);
      const uploadedUrl = res?.data?.url || res?.url;
      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
        updateVideoSettings({ videoUrl: uploadedUrl });
        toast.success("New promotional video uploaded successfully!");
      }
    } catch {
      const localPreviewUrl = URL.createObjectURL(file);
      setVideoUrl(localPreviewUrl);
      updateVideoSettings({ videoUrl: localPreviewUrl });
      toast.info("Using local preview for video. Ensure video file is deployed to /videos.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Handle Save Video Settings
  const handleSaveVideoSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    updateVideoSettings({
      videoUrl: videoUrl.trim(),
      title: videoTitle.trim(),
      description: videoDescription.trim(),
    });
    await saveToBackend();
    toast.success("Promotional video settings saved successfully!");
  };

  // Handle Reset Video
  const handleResetVideo = () => {
    resetVideoToDefault();
    setVideoUrl(DEFAULT_VIDEO_SETTINGS.videoUrl);
    setVideoTitle(DEFAULT_VIDEO_SETTINGS.title);
    setVideoDescription(DEFAULT_VIDEO_SETTINGS.description);
    toast.info("Promotional video reset to default.");
  };

  // Handle Leader Image Upload
  const handleLeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    try {
      setIsUploadingLeaderImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post<any>("/upload/media", formData);
      const uploadedUrl = res?.data?.url || res?.url;
      if (uploadedUrl) {
        setLeaderFormData((prev) => ({ ...prev, image: uploadedUrl }));
        toast.success("Leader image uploaded!");
      }
    } catch {
      const localPreview = URL.createObjectURL(file);
      setLeaderFormData((prev) => ({ ...prev, image: localPreview }));
      toast.info("Image preview updated.");
    } finally {
      setIsUploadingLeaderImage(false);
    }
  };

  // Handle Save Leader (Create or Update)
  const handleSaveLeaderModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderFormData.name.trim() || !leaderFormData.role.trim()) {
      toast.error("Please provide both a name and role for the leader.");
      return;
    }

    if (editingLeader) {
      updateLeader(editingLeader.id, {
        name: leaderFormData.name.trim(),
        role: leaderFormData.role.trim(),
        image: leaderFormData.image.trim() || "/leaders/Jessica - Founder.png",
      });
      toast.success("Leader updated successfully!");
    } else {
      addLeader({
        name: leaderFormData.name.trim(),
        role: leaderFormData.role.trim(),
        image: leaderFormData.image.trim() || "/leaders/Jessica - Founder.png",
      });
      toast.success("New leader added to team!");
    }

    setEditingLeader(null);
    setIsAddingLeader(false);
    setLeaderFormData({ name: "", role: "", image: "" });
    saveToBackend();
  };

  // Handle Save Leaders Section Headers
  const handleSaveLeadersSection = async (e: React.FormEvent) => {
    e.preventDefault();
    updateLeadersSettings({
      sectionTitle: leadersSectionTitle.trim(),
      sectionDescription: leadersSectionDescription.trim(),
    });
    await saveToBackend();
    toast.success("Leadership section text updated successfully!");
  };

  // Handle Reset Leaders
  const handleResetLeaders = () => {
    resetLeadersToDefault();
    setLeadersSectionTitle(DEFAULT_LEADERS_SETTINGS.sectionTitle);
    setLeadersSectionDescription(DEFAULT_LEADERS_SETTINGS.sectionDescription);
    toast.info("Leadership team reset to default.");
  };

  // Handle Partner Image Upload
  const handlePartnerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    try {
      setIsUploadingPartnerImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post<any>("/upload/media", formData);
      const uploadedUrl = res?.data?.url || res?.url;
      if (uploadedUrl) {
        setPartnerFormData((prev) => ({ ...prev, image: uploadedUrl }));
        toast.success("Partner image uploaded!");
      }
    } catch {
      const localPreview = URL.createObjectURL(file);
      setPartnerFormData((prev) => ({ ...prev, image: localPreview }));
      toast.info("Partner image preview updated.");
    } finally {
      setIsUploadingPartnerImage(false);
    }
  };

  // Handle Save Partner (Create or Update)
  const handleSavePartnerModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerFormData.name.trim() || !partnerFormData.position.trim()) {
      toast.error("Please provide both a name and position for the partner.");
      return;
    }

    if (editingPartner) {
      updatePartner(editingPartner.id, {
        name: partnerFormData.name.trim(),
        position: partnerFormData.position.trim(),
        company: partnerFormData.company.trim(),
        image: partnerFormData.image.trim() || DEFAULT_PARTNERS_SETTINGS.members[0].image,
        link: partnerFormData.link.trim(),
        bio: partnerFormData.bio.trim(),
      });
      toast.success("Partner updated successfully!");
    } else {
      addPartner({
        name: partnerFormData.name.trim(),
        position: partnerFormData.position.trim(),
        company: partnerFormData.company.trim(),
        image: partnerFormData.image.trim() || DEFAULT_PARTNERS_SETTINGS.members[0].image,
        link: partnerFormData.link.trim(),
        bio: partnerFormData.bio.trim(),
      });
      toast.success("New partner added!");
    }

    setEditingPartner(null);
    setIsAddingPartner(false);
    setPartnerFormData({ name: "", position: "", company: "", image: "", link: "", bio: "" });
    saveToBackend();
  };

  // Handle Save Partners Section Headers
  const handleSavePartnersSection = async (e: React.FormEvent) => {
    e.preventDefault();
    updatePartnersSettings({
      sectionTitle: partnersSectionTitle.trim(),
      sectionDescription: partnersSectionDescription.trim(),
    });
    await saveToBackend();
    toast.success("Partners section text updated successfully!");
  };

  // Handle Reset Partners
  const handleResetPartners = () => {
    resetPartnersToDefault();
    setPartnersSectionTitle(DEFAULT_PARTNERS_SETTINGS.sectionTitle);
    setPartnersSectionDescription(DEFAULT_PARTNERS_SETTINGS.sectionDescription);
    toast.info("Partners section reset to default.");
  };

  return (
    <div className="space-y-8 w-full pb-20">
      {/* Header */}
      <AdminPageHeader
        title="Homepage Content & Media"
        description="Edit the landing page promotional vision video, headlines, leadership team profiles, and strategic partners in real time."
      >
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:bg-sky-50 shadow-2xs transition-colors cursor-pointer"
          >
            <span>View Public Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </AdminPageHeader>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "video"
              ? "bg-[#0A54B1] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Promotional Vision Video</span>
        </button>

        <button
          onClick={() => setActiveTab("leaders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "leaders"
              ? "bg-[#0A54B1] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Executive Leadership Team ({leadersSettings.members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("partners")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "partners"
              ? "bg-[#0A54B1] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Strategic Partners ({partnersSettings.members.length})</span>
        </button>
      </div>

      {/* TAB 1: PROMOTIONAL VIDEO MANAGEMENT */}
      {activeTab === "video" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form Configuration Column */}
          <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Promotional Video Settings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This video plays directly in the landing page vision section.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetVideo}
                className="text-xs text-slate-600 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Defaults
              </Button>
            </div>

            <form onSubmit={handleSaveVideoSettings} className="space-y-5">
              {/* Video URL & File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Video Source URL or File
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="/videos/Event Promotion Video (2).mp4"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition-colors"
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoFileUpload}
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingVideo}
                    className="rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {isUploadingVideo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-sky-600" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Upload MP4
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  You can upload an MP4/WebM video or paste any public media URL or local path.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Section Headline / Title
                </label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Experience the iFormat Vision"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Section Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Watch how our technology and psychological branding elevate executive careers & high-growth brands."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-semibold h-10 px-6 shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Video Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Video Player Preview
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Direct In-Section Playback
                </span>
              </div>

              {/* Video Player Box */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-900 shadow-md flex items-center justify-center">
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Headline Preview Box */}
              <div className="bg-slate-900 rounded-2xl p-5 text-center space-y-2 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                  Landing Overlay Preview
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {videoTitle || "Experience the iFormat Vision"}
                </h3>
                <p className="text-xs text-cyan-200/80 max-w-md mx-auto leading-relaxed">
                  {videoDescription || "Watch how our technology elevates careers..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEADERS MANAGEMENT */}
      {activeTab === "leaders" && (
        <div className="space-y-8">
          {/* Section Headers Configuration */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Leadership Section Titles
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the section heading and descriptive text displayed above the leader cards.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetLeaders}
                className="text-xs text-slate-600 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Defaults
              </Button>
            </div>

            <form onSubmit={handleSaveLeadersSection} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Section Title
                </label>
                <input
                  type="text"
                  required
                  value={leadersSectionTitle}
                  onChange={(e) => setLeadersSectionTitle(e.target.value)}
                  placeholder="Meet the Leaders"
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
                  value={leadersSectionDescription}
                  onChange={(e) => setLeadersSectionDescription(e.target.value)}
                  placeholder="Work with industry veterans who understand modern hiring..."
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
                  setLeaderFormData({ name: "", role: "", image: "" });
                  setIsAddingLeader(true);
                }}
                className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Leader</span>
              </Button>
            </div>

            {/* Grid of Leaders */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {leadersSettings.members.map((leader) => (
                <div
                  key={leader.id}
                  className="group relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image Container */}
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

                    {/* Quick Action Badges */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingLeader(leader);
                          setLeaderFormData({
                            name: leader.name,
                            role: leader.role,
                            image: leader.image,
                          });
                          setIsAddingLeader(true);
                        }}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                        title="Edit Leader"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${leader.name} from leadership team?`)) {
                            deleteLeader(leader.id);
                            saveToBackend();
                            toast.success(`${leader.name} removed.`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Delete Leader"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Name & Role on Photo */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                      <h4 className="font-bold text-sm leading-tight drop-shadow-xs truncate">
                        {leader.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-cyan-300 drop-shadow-xs truncate mt-0.5">
                        {leader.role}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setEditingLeader(leader);
                        setLeaderFormData({
                          name: leader.name,
                          role: leader.role,
                          image: leader.image,
                        });
                        setIsAddingLeader(true);
                      }}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${leader.name}?`)) {
                          deleteLeader(leader.id);
                          saveToBackend();
                          toast.success(`${leader.name} removed.`);
                        }
                      }}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNERS MANAGEMENT */}
      {activeTab === "partners" && (
        <div className="space-y-8">
          {/* Section Headers Configuration */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Strategic Partners Section Titles
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the section heading and descriptive text displayed above the partner cards on the landing page.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetPartners}
                className="text-xs text-slate-600 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Defaults
              </Button>
            </div>

            <form onSubmit={handleSavePartnersSection} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Section Title
                </label>
                <input
                  type="text"
                  required
                  value={partnersSectionTitle}
                  onChange={(e) => setPartnersSectionTitle(e.target.value)}
                  placeholder="Strategic Partners"
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
                  value={partnersSectionDescription}
                  onChange={(e) => setPartnersSectionDescription(e.target.value)}
                  placeholder="Collaborating with elite global talent networks..."
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

          {/* Partners List & Cards */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Partner Profiles ({partnersSettings.members.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage photos, names, positions, company associations, and website links for each strategic partner.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setEditingPartner(null);
                  setPartnerFormData({ name: "", position: "", company: "", image: "", link: "", bio: "" });
                  setIsAddingPartner(true);
                }}
                className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partner</span>
              </Button>
            </div>

            {/* Grid of Partners */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {partnersSettings.members.map((partner) => (
                <div
                  key={partner.id}
                  className="group relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-3/4 w-full bg-slate-200 overflow-hidden">
                    {partner.image ? (
                      <Image
                        src={partner.image}
                        alt={partner.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <Handshake className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-black/30 to-transparent" />

                    {/* Quick Action Badges */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => {
                          setEditingPartner(partner);
                          setPartnerFormData({
                            name: partner.name,
                            position: partner.position,
                            company: partner.company || "",
                            image: partner.image,
                            link: partner.link || "",
                            bio: partner.bio || "",
                          });
                          setIsAddingPartner(true);
                        }}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                        title="Edit Partner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${partner.name} from partners?`)) {
                            deletePartner(partner.id);
                            saveToBackend();
                            toast.success(`${partner.name} removed.`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Details on Photo */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                      {partner.company && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-500/20 px-2 py-0.5 rounded-md backdrop-blur-xs mb-1 truncate max-w-full">
                          <Building2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{partner.company}</span>
                        </span>
                      )}
                      <h4 className="font-bold text-sm leading-tight drop-shadow-xs truncate">
                        {partner.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-cyan-300 drop-shadow-xs truncate mt-0.5">
                        {partner.position}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setEditingPartner(partner);
                        setPartnerFormData({
                          name: partner.name,
                          position: partner.position,
                          company: partner.company || "",
                          image: partner.image,
                          link: partner.link || "",
                          bio: partner.bio || "",
                        });
                        setIsAddingPartner(true);
                      }}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      Edit
                    </button>

                    {partner.link && (
                      <Link
                        href={partner.link}
                        target="_blank"
                        className="text-xs font-medium text-slate-500 hover:text-sky-600 inline-flex items-center gap-1"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${partner.name}?`)) {
                          deletePartner(partner.id);
                          saveToBackend();
                          toast.success(`${partner.name} removed.`);
                        }
                      }}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Leader Modal */}
      {isAddingLeader && (
        <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              setIsAddingLeader(false);
              setEditingLeader(null);
            }}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingLeader ? "Edit Leader Profile" : "Add Leadership Team Member"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update photo, name, and executive designation.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingLeader(false);
                  setEditingLeader(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeaderModal} className="space-y-4">
              {/* Photo Preview & Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {leaderFormData.image ? (
                    <Image
                      src={leaderFormData.image}
                      alt="Leader Preview"
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    ref={leaderImageInputRef}
                    onChange={handleLeaderImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => leaderImageInputRef.current?.click()}
                    disabled={isUploadingLeaderImage}
                    className="w-full text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    {isUploadingLeaderImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Upload New Photo
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Recommended: 3:4 portrait photo (JPG, PNG, WebP).
                  </p>
                </div>
              </div>

              {/* Image Path / URL direct input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo Path or URL
                </label>
                <input
                  type="text"
                  required
                  value={leaderFormData.image}
                  onChange={(e) =>
                    setLeaderFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="/leaders/Jessica - Founder.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={leaderFormData.name}
                  onChange={(e) =>
                    setLeaderFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Jessica"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Role / Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role / Executive Title
                </label>
                <input
                  type="text"
                  required
                  value={leaderFormData.role}
                  onChange={(e) =>
                    setLeaderFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  placeholder="e.g. Founder & Managing Director"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingLeader(false);
                    setEditingLeader(null);
                  }}
                  className="rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-semibold px-5 cursor-pointer"
                >
                  {editingLeader ? "Save Changes" : "Add Leader"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Partner Modal */}
      {isAddingPartner && (
        <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              setIsAddingPartner(false);
              setEditingPartner(null);
            }}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPartner ? "Edit Partner Profile" : "Add Strategic Partner"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure photo, executive position, company, and links.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingPartner(false);
                  setEditingPartner(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartnerModal} className="space-y-4">
              {/* Photo Preview & Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {partnerFormData.image ? (
                    <Image
                      src={partnerFormData.image}
                      alt="Partner Preview"
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Handshake className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    ref={partnerImageInputRef}
                    onChange={handlePartnerImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => partnerImageInputRef.current?.click()}
                    disabled={isUploadingPartnerImage}
                    className="w-full text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    {isUploadingPartnerImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Upload Partner Photo
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Recommended: 3:4 portrait photo (JPG, PNG, WebP).
                  </p>
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo Path or URL
                </label>
                <input
                  type="text"
                  required
                  value={partnerFormData.image}
                  onChange={(e) =>
                    setPartnerFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="https://... or /leaders/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Partner Name
                </label>
                <input
                  type="text"
                  required
                  value={partnerFormData.name}
                  onChange={(e) =>
                    setPartnerFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Marcus Sterling"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Position / Title
                </label>
                <input
                  type="text"
                  required
                  value={partnerFormData.position}
                  onChange={(e) =>
                    setPartnerFormData((prev) => ({ ...prev, position: e.target.value }))
                  }
                  placeholder="e.g. Managing Partner"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Company / Organization (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={partnerFormData.company}
                  onChange={(e) =>
                    setPartnerFormData((prev) => ({ ...prev, company: e.target.value }))
                  }
                  placeholder="e.g. Apex Talent Ventures"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Website / LinkedIn Link (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website / Profile Link <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={partnerFormData.link}
                  onChange={(e) =>
                    setPartnerFormData((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingPartner(false);
                    setEditingPartner(null);
                  }}
                  className="rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl text-xs font-semibold px-5 cursor-pointer"
                >
                  {editingPartner ? "Save Changes" : "Add Partner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
