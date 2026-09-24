"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, MessageSquare, Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { contactFormSchema, ContactFormData } from "@/lib/validations";
import { apiClient } from "@/lib/api/api-client";

export function Contact() {
  const [contactInfo, setContactInfo] = useState({
    location: "123 Business Pkwy, Suite 400\nNew York, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "info@iformatbranding.com",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  useEffect(() => {
    apiClient
      .get<{ location: string; phone: string; email: string }>("/settings/contact")
      .then((res: any) => {
        const data = res?.data || res;
        if (data && (data.location || data.phone || data.email)) {
          setContactInfo({
            location: data.location || "123 Business Pkwy, Suite 400\nNew York, NY 10001",
            phone: data.phone || "+1 (555) 123-4567",
            email: data.email || "info@iformatbranding.com",
          });
        }
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await apiClient.post("/settings/contact", data);
      toast.success(`Thank you, ${data.fullName}! Your message has been sent to our team.`);
      reset();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <section className="bg-[#0f172a] text-white py-24 overflow-hidden" id="contact">
      <div className="max-w-360 mx-auto w-11/12">
        <ScrollReveal yOffset={40}>
          <SectionHeader
            theme="dark"
            title="Contact Us"
            description="Ready to elevate your professional brand? Get in touch for a free consultation."
            maxWidth="max-w-2xl"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Info */}
          <ScrollReveal yOffset={40} delay={0.2}>
            <div>
              <h3 className="text-2xl font-bold mb-8 border-b border-slate-800 pb-4">Contact Address</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Our Location</h4>
                    <p className="text-slate-400 text-sm whitespace-pre-line">{contactInfo.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Message Us On WhatsApp / Phone</h4>
                    <a
                      href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, "")}`}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Send Your Message</h4>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal yOffset={40} delay={0.4}>
            <div>
              <h3 className="text-2xl font-bold mb-8 border-b border-slate-800 pb-4">Get In Touch</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    placeholder="Your Name"
                    {...register("fullName")}
                    className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-400 mt-1 font-medium">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      placeholder="Email Address"
                      type="email"
                      {...register("email")}
                      className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 mt-1 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      placeholder="Phone Number"
                      type="tel"
                      {...register("phone")}
                      className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    placeholder="How can we help you?"
                    rows={4}
                    {...register("message")}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-400 mt-1 font-medium">{errors.message.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="gradient"
                  className="w-full h-12 text-base font-semibold cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Message <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
