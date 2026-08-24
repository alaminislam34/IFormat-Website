"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, MessageSquare, Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { contactFormSchema, ContactFormData } from "@/lib/validations";

export function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate contact submission
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success(`Thank you, ${data.fullName}! Your message has been sent.`);
    reset();
  };

  return (
    <section className="bg-[#0f172a] text-white py-24 overflow-hidden" id="contact">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal yOffset={40}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-slate-400">
              Ready to elevate your professional brand? Get in touch for a free consultation.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Info */}
          <ScrollReveal yOffset={40} delay={0.2}>
            <div>
              <h3 className="text-2xl font-bold mb-8 border-b border-slate-800 pb-4">Contact Address</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#22d3ee]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Our Location</h4>
                    <p className="text-slate-400 text-sm">123 Business Pkwy, Suite 400<br/>New York, NY 10001</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#22d3ee]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Message Us On WhatsApp</h4>
                    <p className="text-slate-400 text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#22d3ee]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Send Your Message</h4>
                    <p className="text-slate-400 text-sm">hello@iformat.com</p>
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
