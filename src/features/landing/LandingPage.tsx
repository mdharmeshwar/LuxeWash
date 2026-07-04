import * as React from "react";
import { 
  Calendar, Shield, Clock, ShieldCheck, ChevronRight, Star, HelpCircle, 
  ArrowRight, Gem, Wrench, CheckCircle
} from "lucide-react";
import { Card, Button, Badge, OptimizedCarImage } from "../../shared/ui/UiComponents";
import { ServicePackage } from "../../shared/types";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  services: ServicePackage[];
  activeTab: string;
  onNavigateToTab: (tabId: string) => void;
  onSectionChange: (section: string) => void;
}

const SERVICE_IMAGES: Record<string, string> = {
  "express-wash": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=70",
  "deluxe-wash": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=70",
  "premium-detailing": "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=600&q=70",
  "ceramic-coating": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=70"
};

const HERO_CAROUSEL_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=75",
    label: "Express exterior wash",
    subtitle: "Foam, rinse, and shine"
  },
  {
    src: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=75",
    label: "Ceramic protection",
    subtitle: "Hydrophobic finish applied"
  },
  {
    src: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=75",
    label: "Interior detailing",
    subtitle: "Vacuum, steam, and polish"
  },
  {
    src: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=75",
    label: "Premium hand care",
    subtitle: "Paint-safe finishing touches"
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ services, activeTab, onNavigateToTab, onSectionChange }) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  
  const [activeHeroImage, setActiveHeroImage] = React.useState<number>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const values = [
    {
      icon: ShieldCheck,
      title: "PREMIUM QUALITY",
      description: "Top quality nano-polymers & 9H ceramic coatings with premium expert care."
    },
    {
      icon: Clock,
      title: "TIME SAVING",
      description: "Reserved detailing bays. 100% on-time floor schedule compliance."
    },
    {
      icon: Shield,
      title: "VEHICLE SAFE",
      description: "100% scratch-free micro-fiber wash tech, safe for luxury paint."
    },
    {
      icon: Gem,
      title: "BEST PRICES",
      description: "Premium auto preservation with transparent competitive pricing packages."
    }
  ];

  const testimonials = [
    {
      name: "Arthur Pendelton",
      role: "Collector, Classic Motors LLC",
      comment: "LuxeWash has taken care of my entire classic collection. Their attention to detail on paint decontamination is second to none.",
      rating: 5,
      car: "Porsche 911 (1989)"
    },
    {
      name: "Serena Chambers",
      role: "Partner, Chambers Capital",
      comment: "The convenience of booking online and the meticulous quality of the Ceramic Coating is unmatched. Showroom finish every single time.",
      rating: 5,
      car: "Porsche Taycan Turbo S"
    },
    {
      name: "Julian Rivera",
      role: "Founder, Apex Creative",
      comment: "I get my car detailed here twice a month. The floor staff are absolute professionals who treat every vehicle like a piece of high art.",
      rating: 5,
      car: "Audi e-tron GT"
    }
  ];

  const faqs = [
    {
      q: "What is included in the Ceramic Coating package?",
      a: "Our Ceramic Coating includes multi-stage paint compound correction, full clay bar decontamination, 9H nano-ceramic protective coating, water-beading hydrophobic layers, and premium alloy rim defense. It is our ultimate aesthetic shielding process."
    },
    {
      q: "Can I reschedule or cancel my floor booking?",
      a: "Yes, you can easily reschedule or cancel your appointment through the Floor Schedule dashboard or by contacting support at least 4 hours before your slot. Free of charge."
    },
    {
      q: "Do you specialize in electric and low-ground clearance supercars?",
      a: "Absolutely. Our master detailers are highly trained in EV battery-safe cleaning protocols and utilize custom low-profile bay ramps specifically designed for hypercars."
    },
    {
      q: "How often should I get the Express Wash?",
      a: "To maintain your paint gloss and clear coat preservation, we recommend our hand Express Wash every 2 to 3 weeks."
    }
  ];


  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroImage((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen pb-12 overflow-x-hidden text-neutral-200 bg-[#07080b]">
      
      {/* Ambient background glows — pointer-events-none, no repaints */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.07),transparent_60%)] pointer-events-none" style={{ willChange: "auto" }} />
      
      {/* Decorative vertical carbon lines */}
      <div className="absolute top-0 right-10 w-[1px] h-full bg-neutral-900/30 hidden xl:block" />
      <div className="absolute top-0 left-10 w-[1px] h-full bg-neutral-900/30 hidden xl:block" />

      {/* Keep hero section mounted on home & services tabs to prevent layout collapse and scroll-jank oscillation loops */}
      {(activeTab === "home" || activeTab === "services") && (
        <section className="relative pt-8 pb-16 md:pt-12 md:pb-20 overflow-hidden border-b border-neutral-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column - Headline & Theme Select */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/40 border border-red-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-mono">MORE THAN A WASH</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight uppercase">
                IT'S NOT JUST A WASH<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-white italic">
                  IT'S A SUPERCAR EXPERIENCE
                </span>
              </h1>
              
              <p className="text-neutral-400 text-sm sm:text-base max-w-xl leading-relaxed">
                Premium car wash & exquisite detailing services that bring back the pristine showroom shine. Utilizing molecular surface technology and scratch-free detailing systems.
              </p>

              {/* Auto-rotating car servicing gallery */}
              <div className="p-4 bg-neutral-950/70 border border-neutral-900 rounded-xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">LIVE GARAGE GALLERY</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-7 relative aspect-video rounded-lg overflow-hidden border border-neutral-900 bg-neutral-900">
                    <AnimatePresence mode="wait">
                    <motion.img
                        key={HERO_CAROUSEL_IMAGES[activeHeroImage].src}
                        src={HERO_CAROUSEL_IMAGES[activeHeroImage].src}
                        alt={HERO_CAROUSEL_IMAGES[activeHeroImage].label}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="h-full w-full object-cover"
                        style={{ willChange: "transform, opacity" }}
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 bg-black/75 px-2 py-0.5 rounded border border-neutral-800 text-[8px] font-mono text-red-500 uppercase">
                      {HERO_CAROUSEL_IMAGES[activeHeroImage].label}
                    </div>
                    <div className="absolute bottom-3 left-3 text-left">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white">{HERO_CAROUSEL_IMAGES[activeHeroImage].subtitle}</p>
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[9px] font-mono text-neutral-200">
                      {activeHeroImage + 1}/{HERO_CAROUSEL_IMAGES.length}
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-3">
                    <div className="rounded-lg border border-neutral-800 bg-black/40 p-3">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">Now showing</p>
                      <h3 className="mt-1 text-base font-semibold text-white">{HERO_CAROUSEL_IMAGES[activeHeroImage].label}</h3>
                      <p className="mt-1 text-sm text-neutral-400">Premium detailing, safe paint care, and signature finish quality.</p>
                    </div>
                    <div className="flex gap-2">
                      {HERO_CAROUSEL_IMAGES.map((image, index) => (
                        <button
                          key={image.label}
                          onClick={() => setActiveHeroImage(index)}
                          className={`h-2.5 flex-1 rounded-full transition-all ${index === activeHeroImage ? "bg-red-600" : "bg-neutral-800"}`}
                          aria-label={`Show ${image.label}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button variant="primary" size="lg" className="px-8 flex items-center gap-2" onClick={() => onNavigateToTab("booking")} aria-label="Book an appointment now">
                  BOOK APPOINTMENT <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="lg" className="px-8" aria-label="Explore services" onClick={() => {
                  const el = document.getElementById("services-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}>
                  EXPLORE SERVICES
                </Button>
              </div>
            </motion.div>

            {/* Right Column - PREMIUM SERVICE CONCIERGE CARD */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl blur-2xl opacity-15" />
              
              <div className="relative bg-[#0c0d12]/95 border border-neutral-900 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
                <div className="border-b border-neutral-900 pb-3">
                  <h3 className="text-lg font-bold text-white tracking-wide uppercase">LUXURY SERVICE CONCIERGE</h3>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-wider font-mono">A premium experience built around precision and care</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-red-500/15 bg-red-600/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">Signature promise</span>
                      <span className="text-sm font-black text-white">4.9/5</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                      From ceramic protection to deep detailing, every visit is handled with showroom-level precision and zero compromise.
                    </p>
                  </div>

                  <ul className="space-y-3 text-sm text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span>Luxury-grade products with scratch-safe finishing and transparent pricing.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span>Dedicated detailing specialists with fast, calm, and high-touch service.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span>Flexible packages for daily drivers, collectors, and premium fleet vehicles.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="primary" size="md" onClick={() => {
                    const el = document.getElementById("services-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}>
                    Discover treatment packages
                  </Button>
                  <Button variant="secondary" size="md" onClick={() => {
                    const el = document.getElementById("testimonials-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}>
                    Explore driver feedback
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-neutral-600 text-[9px] font-mono uppercase pt-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" />
                  PERFORMANCE DETAILING, REIMAGINED
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
      )}



      {/* Horizontal Value Props Row */}
      <section className="py-6 bg-neutral-950/40 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="flex gap-3 text-left">
                  <div className="p-2 bg-red-950/20 border border-red-500/10 rounded-lg text-red-500 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider leading-tight mb-0.5">{val.title}</h4>
                    <p className="text-[10px] text-neutral-500 leading-normal">{val.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FULL-WIDTH PREMIUM SERVICES GRID (Sleek, uncluttered, beautifully premium) */}
      <section className="py-20 border-b border-neutral-900 bg-neutral-950/20">
        <div id="services-section" className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12 text-left">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[9px] font-mono tracking-widest text-red-500 uppercase font-bold">FORMULA TREATMENT INDEX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">OUR PREMIUM TREATMENT SERVICES</h2>
            <p className="text-neutral-500 text-xs sm:text-sm uppercase tracking-wider font-mono">
              Engineered nano-polymer processes, flawless scratch-free wash chemistry, and premium paint defense
            </p>
          </div>

          {/* Grid of 4 wash packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv) => {
              const imgUrl = SERVICE_IMAGES[srv.id] || "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=70";
              const isUltra = srv.id === "ceramic-coating" || srv.id === "premium-detailing";
              
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    sessionStorage.setItem("quickService", srv.id);
                    onNavigateToTab("booking");
                  }}
                  className="group cursor-pointer text-left relative transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02]"
                  style={{ willChange: "transform" }}
                >
                  <Card 
                    glow={isUltra}
                    hoverEffect
                    className="flex flex-col justify-between h-full p-5 bg-[#0c0d12] border-neutral-900 hover:border-red-600/30 relative"
                  >
                    <div className="space-y-4">
                      {/* Image frame */}
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-950 bg-neutral-900">
                        <OptimizedCarImage 
                          src={imgUrl} 
                          alt={srv.name} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        {isUltra && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="warning">SiO2 SHIELD</Badge>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors uppercase truncate">
                            {srv.name}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom specifications */}
                    <div className="mt-6 pt-4 border-t border-neutral-900/60 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase">
                      <div className="space-y-1">
                        <span className="block text-[8px] text-neutral-600">DURATION</span>
                        <span className="block text-neutral-300 font-semibold">{srv.duration}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] text-neutral-600">CHARGE</span>
                        <span className="block text-red-500 font-black text-sm">₹{srv.price}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM METRICS COUNTER STATUS */}
      <section className="py-12 border-y border-neutral-900 bg-neutral-950/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-red-600 font-display">15K+</div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">HAPPY CUSTOMERS</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white font-display">25K+</div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">CARS SERVICED</div>
            </div>
            <div>
              <div className="text-4xl font-black text-red-600 font-display">50+</div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">EXPERTS STAFF</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white font-display flex items-center justify-center gap-1.5">
                4.9 <div className="flex text-amber-400 text-xs mt-1">★★★★★</div>
              </div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">CUSTOMER RATING</div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logo Seeding Row */}
      <section className="py-10 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">WE WORK WITH THE BEST AUTOMOTIVE PRODUCTS</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-40 grayscale contrast-200">
            {["3M DETAILING", "SONAX CHEM", "MEGUIAR'S", "TURTLE WAX PRO", "CHEMICAL GUYS"].map((b, i) => (
              <span key={i} className="text-sm font-black tracking-widest text-white uppercase font-mono">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section id="testimonials-section" className="py-20 bg-[#0c0d12]/40 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-14 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              ELITE DRIVER FEEDBACK
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm uppercase tracking-wider font-mono">
              Complete cosmetic satisfaction from premium vehicle owners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="flex flex-col justify-between h-full p-6 bg-[#0c0d12] border border-neutral-900 hover:border-red-600/10 text-left">
                  <div className="space-y-4">
                    {/* Glowing Stars */}
                    <div className="flex gap-0.5">
                      {[...Array(t.rating)].map((_, sIdx) => (
                        <Star key={sIdx} className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-300 italic leading-relaxed">
                      "{t.comment}"
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-neutral-900/60 mt-6 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{t.name}</h4>
                      <span className="text-[9px] font-mono text-neutral-500 mt-0.5 block uppercase">{t.role}</span>
                    </div>
                    <Badge variant="neutral">{t.car}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-b border-neutral-900">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-left">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              FREQUENTLY ANSWERED QUERIES
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm uppercase tracking-wider font-mono">
              automotive chemistry, booking schedules, and warranty details
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-[#0c0d12] border border-neutral-900 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 text-sm font-semibold text-white focus-visible:bg-neutral-900 hover:bg-neutral-900/40 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-red-500 shrink-0" />
                      {f.q}
                    </span>
                    <svg
                      className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-neutral-900/40 pt-4 bg-neutral-950/30"
                    >
                      {f.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#040508] py-16 text-xs border-t border-neutral-900 text-neutral-500">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-white uppercase font-display block leading-tight">LuxeWash</span>
            </div>
            <p className="text-neutral-500 max-w-xs leading-relaxed">
              Meticulous luxury auto preservation, advanced paint defense, and professional ceramic detailing bay bookings.
            </p>
          </div>

          {/* Links 1 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[10px] font-mono">NAVIGATION</h4>
            <ul className="space-y-2">
              <li><button onClick={() => {
                const el = document.getElementById("services-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} className="hover:text-red-500 transition-colors">View Wash Packages</button></li>
              <li><button onClick={() => {
                const el = document.getElementById("testimonials-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} className="hover:text-red-500 transition-colors">Read Client Stories</button></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[10px] font-mono">SERVICES</h4>
            <ul className="space-y-2">
              <li><button onClick={() => {
                const el = document.getElementById("services-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} className="hover:text-red-500 transition-colors">Express Wash</button></li>
              <li><button onClick={() => {
                const el = document.getElementById("services-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} className="hover:text-red-500 transition-colors">Deluxe Wash</button></li>
              <li><button onClick={() => {
                const el = document.getElementById("services-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} className="hover:text-red-500 transition-colors">Premium Detailing</button></li>
              <li><button onClick={() => {
                const el = document.getElementById("services-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} className="hover:text-red-500 transition-colors">Ceramic Coating</button></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[10px] font-mono">BAY HEADQUARTERS</h4>
            <p className="leading-relaxed text-neutral-400">
              900 Enterprise Way, Detailing Bay 01<br />
              San Francisco, CA 94107<br />
              <span className="text-red-500 font-mono">service@luxewash-spa.com</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-600 text-center">
          <span>© 2026 LuxeWash LLC. All rights reserved. Professional Supercar Preservations.</span>
          <div className="flex gap-4 font-mono text-[10px]">
            <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
