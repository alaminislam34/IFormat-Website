"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, RotateCcw, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/utils";
import { apiClient } from "@/lib/api/api-client";
import { toast } from "sonner";
import {
  useLandingContentStore,
  DEFAULT_VIDEO_SETTINGS,
} from "@/stores/use-landing-content-store";

export function PromotionalVideoSection() {
  const {
    videoSettings,
    updateVideoSettings,
    resetVideoToDefault,
    saveToBackend,
    isSaving,
    isHydrated,
  } = useLandingContentStore();

  const [videoUrl, setVideoUrl] = useState(videoSettings.videoUrl);
  const [videoTitle, setVideoTitle] = useState(videoSettings.title);
  const [videoDescription, setVideoDescription] = useState(videoSettings.description);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isHydrated) {
      setVideoUrl(videoSettings.videoUrl);
      setVideoTitle(videoSettings.title);
      setVideoDescription(videoSettings.description);
    }
  }, [isHydrated, videoSettings]);

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
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload video to server.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

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

  const handleResetVideo = () => {
    resetVideoToDefault();
    setVideoUrl(DEFAULT_VIDEO_SETTINGS.videoUrl);
    setVideoTitle(DEFAULT_VIDEO_SETTINGS.title);
    setVideoDescription(DEFAULT_VIDEO_SETTINGS.description);
    toast.info("Promotional video reset to default.");
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
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
              Upload an MP4/WebM video or paste any public media URL or local path.
            </p>
          </div>

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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Section Subtitle / Description
            </label>
            <textarea
              rows={3}
              required
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              placeholder="Watch how our technology and psychological branding elevate executive careers."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
            />
          </div>

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

          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-900 shadow-md flex items-center justify-center">
            <video
              key={videoUrl}
              src={getMediaUrl(videoUrl)}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

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
  );
}
