"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Brain,
  Layout,
  FileText,
  Move,
  TrendingUp,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState("1-on-1 Career Strategy Consultation");

  const handleOpenBooking = (title: string) => {
    setSelectedServiceTitle(title);
    setIsBookingModalOpen(true);
  };

  const services = [
    {
      title: "Personal Brand Builder",
      price: "$199",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Strategic Branding",
      price: "$249",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Career Hosting Package",
      price: "$129",
      image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "ATS-Compliant CV",
      price: "$89",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Cover Letters",
      price: "$49",
      image: "https://images.unsplash.com/photo-1512429234305-12fe5b0b0fbf?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Templated CV Management",
      price: "$79",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "CEO Biography",
      price: "$159",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Interview Coaching",
      price: "$149",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Monthly Support",
      price: "$99",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const features = [
    {
      title: "Psycholinguistics & NLP",
      desc: "We have used psycholinguistic techniques to establish a writing methodology along with Neuro-Linguistic Programming.",
      icon: <Brain className="w-5 h-5 text-white" />,
    },
    {
      title: "ATS – Applicant Tracking Software",
      desc: "Creating the most ATS Compliant profiles navigating to the top of recruitment and expert searches.",
      icon: <FileText className="w-5 h-5 text-white" />,
    },
    {
      title: "ROI – Return On Investment",
      desc: "Show the experts how you have positively impacted your role, the department, a business or a country.",
      icon: <TrendingUp className="w-5 h-5 text-white" />,
    },
    {
      title: "Concise Writing",
      desc: "Wordy writing dilutes the impact of your message, concise writing, instead, helps grab and hold your reader's attention, it is one of the most desirable leadership characteristics.",
      icon: <Sparkles className="w-5 h-5 text-white" />,
    },
    {
      title: "Easy Eye Movement",
      desc: "Our job is to place information in such a way it is easily found by rapid eye movements through the use of saccades and maximizing saccades, a type of eye movement.",
      icon: <Move className="w-5 h-5 text-white" />,
    },
    {
      title: "Layout Elegance",
      desc: "Elegant, clean, and unobstructed layout focusing only on what we believe to be the most important thing, your legacy, history and content.",
      icon: <Layout className="w-5 h-5 text-white" />,
    },
  ];

  return (
    <main className="min-h-screen bg-white pt-16">
      {/* Services Grid Section */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#0A54B1] border border-blue-100">
              Career Acceleration Services
            </span>
            <h1 className="text-4xl font-bold text-slate-900">Individual Services & Advisory</h1>
            <p className="text-slate-600">
              Choose from tailored services and book 1-on-1 strategy sessions with industry executives.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <ScrollReveal key={idx} yOffset={40} delay={idx * 0.1}>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group h-full flex flex-col">
                <div className="h-56 overflow-hidden relative">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex-1">{service.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-2xl font-bold text-[#0A54B1]">{service.price}</span>
                    <button
                      onClick={() => handleOpenBooking(service.title)}
                      className="flex items-center gap-2 text-xs font-bold text-[#0A54B1] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" /> Book Session
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Unique Methodology Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                What makes <span className="text-[#0A54B1]">iFormat</span> Branding unique
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                We have developed a unique writing methodology that modern AI tools cannot replicate. This is because we have integrated a psycholinguistic technique into our writing, which effectively stimulates interest and shapes perceptions, creating a compelling personal brand, this is done through;
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <ScrollReveal key={idx} yOffset={30} delay={idx * 0.1}>
                <div className="bg-[#f0f7fa] rounded-3xl p-8 text-center h-full hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-[#0A54B1] rounded-xl flex items-center justify-center mb-6 mx-auto shadow-md shadow-blue-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Consultation Booking Modal */}
      {isBookingModalOpen && (
        <BookConsultationModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          serviceTitle={selectedServiceTitle}
        />
      )}
    </main>
  );
}
