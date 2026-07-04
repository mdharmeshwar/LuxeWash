import * as React from "react";
import {
  Search, Calendar, Clock, Car, AlertTriangle,
  Loader2, User, Tag, RefreshCw, Info, Activity
} from "lucide-react";
import { Card, Button, Badge, EmptyState } from "../../shared/ui/UiComponents";
import { Appointment, ServicePackage, ApiResponse } from "../../shared/types";

interface StatusCheckProps {
  services: ServicePackage[];
}

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" | "neutral"; color: string; glow: string }> = {
  "pending": {
    label: "Pending",
    variant: "warning",
    color: "text-amber-400",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]"
  },
  "in-progress": {
    label: "In Detailing Bay",
    variant: "info",
    color: "text-sky-400",
    glow: "shadow-[0_0_12px_rgba(14,165,233,0.3)]"
  },
  "completed": {
    label: "Completed",
    variant: "success",
    color: "text-emerald-400",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.3)]"
  },
  "cancelled": {
    label: "Cancelled",
    variant: "neutral",
    color: "text-neutral-400",
    glow: ""
  }
};

const dotColors: Record<string, string> = {
  "pending": "bg-amber-500 animate-pulse",
  "in-progress": "bg-sky-400 animate-pulse shadow-[0_0_8px_#0ea5e9]",
  "completed": "bg-emerald-500 shadow-[0_0_8px_#10b981]",
  "cancelled": "bg-neutral-600"
};

export const StatusCheck: React.FC<StatusCheckProps> = ({ services }) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Appointment[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const trackAnalytics = () => {
    console.info("[Analytics] User searched appointment status");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter an Appointment ID or email address to search.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setHasSearched(false);

    try {
      const res = await fetch(`/api/appointments?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: ApiResponse<Appointment[]> = await res.json();
      if (data.success && data.data) {
        setResults(data.data);
      } else {
        setResults([]);
      }
      trackAnalytics();
    } catch (err) {
      console.error("Status check error:", err);
      setError("A network error occurred. Please check your connection and try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleReset = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const getServiceName = (serviceId: string) =>
    services.find(s => s.id === serviceId)?.name || serviceId;

  const getServicePrice = (serviceId: string) =>
    services.find(s => s.id === serviceId)?.price ?? 0;

  const getServiceDuration = (serviceId: string) =>
    services.find(s => s.id === serviceId)?.duration ?? "—";

  return (
    <div className="max-w-4xl mx-auto py-10 px-5 sm:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/40 border border-red-500/20 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-mono">LIVE BOOKING LOOKUP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Appointment Status Check</h1>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
          Track the real-time status of your LuxeWash detailing reservation. Enter your Appointment ID (e.g. <span className="font-mono text-red-400">apt-101</span>) or email address to retrieve your booking details.
        </p>
      </div>

      {/* Search Box */}
      <Card className="p-6 sm:p-8 bg-[#0c0d12]">
        <form onSubmit={handleSearch} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="status-search-input"
              className="text-xs font-semibold text-neutral-400 uppercase tracking-wider"
            >
              Appointment ID or Email Address *
            </label>
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                <input
                  id="status-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. apt-101 or elizabeth@example.com"
                  className={`w-full bg-neutral-900 border text-sm rounded-lg py-3 pl-11 pr-4 transition-all duration-200 outline-none text-white placeholder-neutral-600
                    ${error
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                      : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                    }`}
                  aria-label="Search by appointment ID or email"
                  aria-describedby={error ? "search-error" : undefined}
                  aria-invalid={Boolean(error)}
                  autoComplete="off"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                aria-label="Search for appointment"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isLoading ? "Searching..." : "Search"}</span>
              </Button>
            </div>

            {error && (
              <p id="search-error" className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Info Tips Row */}
          <div className="flex flex-wrap gap-3 pt-1">
            {[
              { icon: Tag, text: "Search by Appointment ID" },
              { icon: User, text: "Search by Email Address" },
              { icon: Car, text: "Search by License Plate" },
            ].map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.text}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/60 border border-neutral-800 rounded-full text-[10px] text-neutral-500 font-mono"
                >
                  <Icon className="w-3 h-3 text-red-500" />
                  {tip.text}
                </div>
              );
            })}
          </div>
        </form>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-10 flex flex-col items-center justify-center text-center space-y-4 bg-[#0c0d12]">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-neutral-900 rounded-full" />
            <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Querying Express REST API...</h3>
            <p className="text-xs text-neutral-500 mt-1">Fetching booking records from the floor database</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {!isLoading && hasSearched && (
        <div className="space-y-4">
          {/* Results Count Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
              {results.length > 0
                ? `${results.length} APPOINTMENT${results.length > 1 ? "S" : ""} FOUND`
                : "NO RESULTS"
              }
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors font-mono uppercase tracking-wide"
              aria-label="Clear search results"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Empty State */}
          {results.length === 0 ? (
            <EmptyState
              title="No Appointment Found"
              description="We couldn't find any booking matching your search query. Please double-check your Appointment ID or email address and try again."
              icon={Search}
              action={
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Clear Search
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {results.map((apt) => {
                const status = statusConfig[apt.status] || statusConfig["pending"];
                const dot = dotColors[apt.status] || dotColors["pending"];

                return (
                  <Card
                    key={apt.id}
                    className="p-0 overflow-hidden border-neutral-900 bg-[#0c0d12] hover:border-red-600/20 transition-all duration-300"
                  >
                    {/* Status color bar */}
                    <div className={`h-1 w-full ${
                      apt.status === "completed" ? "bg-emerald-500" :
                      apt.status === "in-progress" ? "bg-sky-400" :
                      apt.status === "pending" ? "bg-amber-500" :
                      "bg-neutral-700"
                    }`} />

                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Top Row: ID + Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Appointment ID</p>
                          <p className="text-base font-black text-red-500 font-mono">#{apt.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Customer */}
                        <div className="space-y-1.5">
                          <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
                            <User className="w-3 h-3 text-red-500" />
                            Client
                          </h3>
                          <p className="text-sm font-bold text-white">{apt.customerName}</p>
                          <p className="text-xs text-neutral-400">{apt.customerEmail}</p>
                          <p className="text-xs text-neutral-500 font-mono">{apt.customerPhone}</p>
                        </div>

                        {/* Vehicle */}
                        <div className="space-y-1.5">
                          <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
                            <Car className="w-3 h-3 text-red-500" />
                            Vehicle
                          </h3>
                          <p className="text-sm font-bold text-white">
                            {apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}
                          </p>
                          <p className="text-xs text-neutral-400">Paint: {apt.vehicleColor}</p>
                          <p className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">{apt.licensePlate}</p>
                        </div>

                        {/* Schedule */}
                        <div className="space-y-1.5">
                          <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-red-500" />
                            Schedule
                          </h3>
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-red-500" />
                            {apt.date}
                          </p>
                          <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-600" />
                            {apt.time}
                          </p>
                        </div>
                      </div>

                      {/* Service Package Bar */}
                      <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-semibold">Selected Package</p>
                          <p className="text-sm font-bold text-white mt-0.5">{getServiceName(apt.serviceId)}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">Duration: {getServiceDuration(apt.serviceId)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Total Charge</p>
                          <p className="text-xl font-black text-red-500">₹{getServicePrice(apt.serviceId).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Notes (if any) */}
                      {apt.notes && (
                        <div className="flex items-start gap-2.5 p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-lg">
                          <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Floor Notes</p>
                            <p className="text-xs text-neutral-300 italic leading-relaxed">"{apt.notes}"</p>
                          </div>
                        </div>
                      )}

                      {/* Booking Timestamp */}
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        Booked on: {new Date(apt.createdAt).toLocaleString("en-IN", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Default empty help state */}
      {!isLoading && !hasSearched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Tag,
              title: "Appointment ID",
              desc: "Enter your appointment ID (e.g. apt-101) to instantly retrieve full booking details.",
              example: "apt-101"
            },
            {
              icon: User,
              title: "Email Lookup",
              desc: "Search using the email address used when booking. Returns all associated reservations.",
              example: "you@example.com"
            },
            {
              icon: Car,
              title: "License Plate",
              desc: "Enter your vehicle's license plate to find all wash appointments for that vehicle.",
              example: "911-LUX"
            }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="p-5 bg-neutral-950/50 border-neutral-900">
                <div className="space-y-3">
                  <div className="p-2 bg-red-950/20 border border-red-500/10 rounded-lg w-fit text-red-500">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{card.title}</h3>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                  <code className="text-[10px] font-mono text-red-400 bg-red-950/20 border border-red-500/10 px-2 py-0.5 rounded">
                    {card.example}
                  </code>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
