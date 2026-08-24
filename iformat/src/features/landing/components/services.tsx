import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Services() {
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
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden" id="services">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal yOffset={40}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Individual Services</h2>
            <p className="text-slate-600">
              A la carte options to boost your professional toolkit.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, idx) => (
            <ScrollReveal key={idx} yOffset={40} delay={idx * 0.15}>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group h-full">
                <div className="h-48 overflow-hidden relative">
                  <Image 
                    src={service.image} 
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex-1">{service.title}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-[#22d3ee]">{service.price}</span>
                    <button className="flex items-center gap-2 text-[#3b82f6] font-medium hover:text-[#2563eb] transition-colors">
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        
        <ScrollReveal yOffset={20} delay={0.4}>
          <div className="text-center">
            <Link href="/services" className="text-[#22d3ee] font-medium hover:underline underline-offset-4">See More</Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
