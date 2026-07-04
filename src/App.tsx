import * as React from "react";
import { Menu, X } from "lucide-react";
import { Toast, ToastMessage } from "./shared/ui/UiComponents";
import { LandingPage } from "./features/landing/LandingPage";
import { BookingFlow } from "./features/booking/BookingFlow";
import { AdminDashboard } from "./features/dashboard/AdminDashboard";
import { StatusCheck } from "./features/status/StatusCheck";
import { ServicePackage, Appointment, ApiResponse } from "./shared/types";

export default function App() {
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    if (typeof window === "undefined") return "home";
    return sessionStorage.getItem("activeTab") || "home";
  });
  const [services, setServices] = React.useState<ServicePackage[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [isLoadingServices, setIsLoadingServices] = React.useState<boolean>(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = React.useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  // Stable reference — won't cause IntersectionObserver to reconnect on every render
  const handleSectionChange = React.useCallback((section: string) => {
    setActiveTab(section);
  }, []);

  const addToast = React.useCallback((type: "success" | "error" | "info", message: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, description }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchServices = React.useCallback(async () => {
    setIsLoadingServices(true);
    try {
      const res = await fetch("/api/services");
      const data: ApiResponse<ServicePackage[]> = await res.json();
      if (data.success && data.data) {
        setServices(data.data);
      } else {
        throw new Error("Services retrieval failed");
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to Load Services", "The backend service packages could not be retrieved.");
    } finally {
      setIsLoadingServices(false);
    }
  }, [addToast]);

  const fetchAppointments = React.useCallback(async () => {
    setIsLoadingAppointments(true);
    try {
      const res = await fetch("/api/appointments");
      const data: ApiResponse<Appointment[]> = await res.json();
      if (data.success && data.data) {
        setAppointments(data.data);
      } else {
        throw new Error("Appointments retrieval failed");
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Database Sync Interrupted", "Failed to download active floor schedules.");
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchServices();
    fetchAppointments();
  }, [fetchServices, fetchAppointments]);

  React.useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const handleNavigateToTab = React.useCallback((tabId: string) => {
    setMobileMenuOpen(false);

    if (tabId === "services") {
      // Don't change tab — just scroll smoothly to the services section.
      // If we're not on the home/services tab already, switch first then scroll.
      setActiveTab(prev => {
        if (prev !== "home" && prev !== "services") {
          // Switching from a different page: go to home first, then scroll
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const el = document.getElementById("services-section");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          });
          return "home";
        }
        // Already on landing page — just scroll
        requestAnimationFrame(() => {
          const el = document.getElementById("services-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return prev;
      });
      return;
    }

    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const menuItems = [
    { id: "home", label: "HOME" },
    { id: "services", label: "SERVICES" },
    { id: "booking", label: "BOOK APPOINTMENT" },
    { id: "status-check", label: "STATUS CHECK" },
    { id: "dashboard", label: "FLOOR SCHEDULE" },
  ];

  const isOnLanding = activeTab === "home" || activeTab === "services";

  return (
    <div className="min-h-screen bg-[#07080b] text-neutral-200 flex flex-col selection:bg-red-600/30 selection:text-red-100">

      {/* HEADER — GPU-promoted sticky layer */}
      <header
        className="sticky top-0 z-40 border-b border-neutral-900"
        style={{ backgroundColor: "rgba(7,8,11,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", transform: "translateZ(0)" }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">

          {/* Logo Brand Emblem */}
          <button
            onClick={() => handleNavigateToTab("home")}
            className="flex items-center gap-3 text-left group outline-none"
            aria-label="LuxeWash home page"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <svg className="w-14 h-5 text-red-600 transition-colors duration-300 group-hover:text-red-500" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 16h6c1.5 0 2.5-0.8 3.5-2l4-5c1-1.2 2.2-2 4-2h20c1.8 0 3 0.8 4 2l4 5c1 1.2 2 2 3.5 2h25c1.5 0 2.5-0.5 3-1.5c0.5-1 0-2.5-1-3c-3-1.5-10-5-15-5H25C15 6.5 8 11.5 5 16z" strokeLinecap="round" />
                  <circle cx="22" cy="16" r="4" fill="#07080b" stroke="currentColor" />
                  <circle cx="74" cy="16" r="4" fill="#07080b" stroke="currentColor" />
                </svg>
                <span className="text-xl font-black tracking-tighter text-white font-display uppercase italic">LUXEWASH</span>
              </div>
              <span className="text-[9px] text-neutral-500 font-mono tracking-widest leading-none block uppercase -mt-0.5 pl-0.5">PREMIUM AUTO DETAILED</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === "services" && activeTab === "services");
              return (
                <button
                  key={item.id}
                  id={`tab-button-${item.id}`}
                  onClick={() => handleNavigateToTab(item.id)}
                  className={`relative py-2 text-xs font-bold tracking-wider transition-colors duration-150 outline-none
                    ${isActive ? "text-red-500" : "text-neutral-400 hover:text-white"}`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-900 bg-[#07080b] p-4 space-y-1.5 shadow-xl">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateToTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors
                    ${isActive
                      ? "text-red-500 bg-red-500/5 font-bold border-l-2 border-red-600 rounded-l-none"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-3 border-t border-neutral-900 flex items-center justify-between px-4 mt-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">FLOOR SECURITY ACTIVE</span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {isLoadingServices ? (
          <div className="max-w-7xl mx-auto py-20 px-5 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-neutral-500 font-mono">Synthesizing luxury service packages...</span>
          </div>
        ) : (
          <>
            {/* Landing page — kept mounted when on home or services to avoid remounting */}
            <div style={{ display: isOnLanding ? "block" : "none" }}>
              <LandingPage
                services={services}
                activeTab={activeTab}
                onNavigateToTab={handleNavigateToTab}
                onSectionChange={handleSectionChange}
              />
            </div>

            {activeTab === "booking" && (
              <BookingFlow
                services={services}
                onAddToast={addToast}
                onBookingSuccess={fetchAppointments}
                onNavigateToTab={handleNavigateToTab}
              />
            )}

            {activeTab === "status-check" && (
              <StatusCheck services={services} />
            )}

            {activeTab === "dashboard" && (
              <AdminDashboard
                services={services}
                appointments={appointments}
                isLoading={isLoadingAppointments}
                onRefresh={fetchAppointments}
                onAddToast={addToast}
              />
            )}
          </>
        )}
      </main>

      {/* TOAST SYSTEM */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3.5 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastMessage toast={t} onClose={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
