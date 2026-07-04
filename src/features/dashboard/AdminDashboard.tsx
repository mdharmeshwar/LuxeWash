import * as React from "react";
import { 
  Search, Trash2, Edit3, Eye, Calendar, Clock, 
  User, CheckCircle2, RefreshCw, Plus, TrendingUp, DollarSign, Activity, 
  Filter, Compass, Database, Loader2 
} from "lucide-react";
import { 
  Card, Button, Input, Table, Badge, Modal, Select, EmptyState, LoadingSkeleton, OptimizedCarImage 
} from "../../shared/ui/UiComponents";
import { Appointment, ServicePackage, ApiResponse } from "../../shared/types";

interface AdminDashboardProps {
  services: ServicePackage[];
  appointments: Appointment[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddToast: (type: "success" | "error" | "info", message: string, description?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  services, appointments, isLoading, onRefresh, onAddToast 
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [serviceFilter, setServiceFilter] = React.useState<string>("all");

  // Selection states for Modals
  const [selectedApt, setSelectedApt] = React.useState<Appointment | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);
  
  // Edit Form state
  const [editForm, setEditForm] = React.useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    licensePlate: "",
    serviceId: "",
    date: "",
    time: "",
    status: "pending",
    notes: ""
  });
  
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesService = serviceFilter === "all" || apt.serviceId === serviceFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      apt.customerName.toLowerCase().includes(searchLower) ||
      apt.customerEmail.toLowerCase().includes(searchLower) ||
      apt.customerPhone.toLowerCase().includes(searchLower) ||
      apt.vehicleMake.toLowerCase().includes(searchLower) ||
      apt.vehicleModel.toLowerCase().includes(searchLower) ||
      apt.licensePlate.toLowerCase().includes(searchLower) ||
      apt.id.toLowerCase().includes(searchLower);

    return matchesStatus && matchesService && matchesSearch;
  });

  // Calculate statistics based on current active state
  const stats = React.useMemo(() => {
    let totalRevenue = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let inProgressCount = 0;

    appointments.forEach((apt) => {
      const srv = services.find(s => s.id === apt.serviceId);
      const price = srv ? srv.price : 0;

      if (apt.status === "completed") {
        totalRevenue += price;
        completedCount++;
      } else if (apt.status === "pending") {
        pendingCount++;
      } else if (apt.status === "in-progress") {
        inProgressCount++;
      }
    });

    return {
      revenue: totalRevenue,
      completed: completedCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      total: appointments.length
    };
  }, [appointments, services]);

  // Handle open view modal
  const handleOpenView = (apt: Appointment) => {
    setSelectedApt(apt);
    setIsViewOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (apt: Appointment) => {
    setSelectedApt(apt);
    setEditForm({
      customerName: apt.customerName,
      customerEmail: apt.customerEmail,
      customerPhone: apt.customerPhone,
      vehicleMake: apt.vehicleMake,
      vehicleModel: apt.vehicleModel,
      vehicleYear: String(apt.vehicleYear),
      vehicleColor: apt.vehicleColor,
      licensePlate: apt.licensePlate,
      serviceId: apt.serviceId,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes || ""
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  // Inline update status
  const handleUpdateStatusInline = async (aptId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const resJson: ApiResponse<Appointment> = await res.json();
      if (res.ok && resJson.success) {
        onAddToast("success", "Status Updated Successfully", `Appointment ${aptId} status is now ${newStatus}.`);
        onRefresh();
      } else {
        throw new Error(resJson.errors?.[0]?.message || "Failed inline update");
      }
    } catch (err) {
      console.error(err);
      onAddToast("error", "Update Failed", "Could not synchronize status change with backend service.");
    }
  };

  // Submit complete Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/appointments/${selectedApt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          vehicleYear: Number(editForm.vehicleYear)
        })
      });

      const resJson: ApiResponse<Appointment> = await res.json();

      if (res.ok && resJson.success) {
        onAddToast("success", "Appointment Synchronized", `Successfully updated details for ${editForm.customerName}.`);
        setIsEditOpen(false);
        onRefresh();
      } else if (resJson.errors) {
        const errorsMap: Record<string, string> = {};
        resJson.errors.forEach(err => {
          if (err.field) {
            errorsMap[err.field] = err.message;
          }
        });
        setEditErrors(errorsMap);
        onAddToast("error", "Validation Errors", "Please correct the highlighted form values before saving.");
      } else {
        throw new Error("Update error");
      }
    } catch (err) {
      console.error(err);
      onAddToast("error", "Network Interruption", "Failed to update appointment on Express server.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Trigger delete operation
  const handleDeleteAppointment = async (aptId: string) => {
    setIsDeletingId(aptId);

    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "DELETE"
      });
      const resJson: ApiResponse<Appointment> = await res.json();

      if (res.ok && resJson.success) {
        onAddToast("success", "Appointment Removed", `Successfully deleted appointment ID ${aptId}.`);
        onRefresh();
      } else {
        throw new Error("Deletion failed");
      }
    } catch (err) {
      console.error(err);
      onAddToast("error", "Deletion Failed", "An error occurred while removing the reservation.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const selectedServiceDetails = services.find(s => s.id === selectedApt?.serviceId);

  return (
    <div className="space-y-8 py-8 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Floor Operations Control</h1>
          <p className="text-xs text-neutral-400 mt-1">Live detailing bay statuses, schedule logs, and corporate customer records.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            icon={RefreshCw} 
            loading={isLoading} 
            onClick={onRefresh}
            aria-label="Refresh floor board"
          >
            Refresh Board
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus} 
            onClick={() => {
              const tabBtn = document.getElementById("tab-button-booking");
              if (tabBtn) tabBtn.click();
            }}
          >
            Create Booking
          </Button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-[#0c0d12] flex items-center justify-between border-neutral-900 shadow-[0_0_15px_rgba(220,38,38,0.05)] hover:border-red-600/20 group transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-red-500 uppercase tracking-wider font-semibold">Active Queue</span>
            <div className="text-2xl font-black text-white font-display">{stats.pending + stats.inProgress}</div>
            <p className="text-[10px] text-neutral-500 font-medium">Pending: {stats.pending} • Detailing: {stats.inProgress}</p>
          </div>
          <div className="p-3 bg-red-600/10 border border-red-500/15 rounded-lg text-red-500 shadow-[0_0_12px_rgba(220,38,38,0.1)] group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-6 bg-[#0c0d12] flex items-center justify-between border-neutral-900 shadow-[0_0_15px_rgba(220,38,38,0.05)] hover:border-red-600/20 group transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">Total Revenue</span>
            <div className="text-2xl font-black text-white font-display">₹{stats.revenue.toLocaleString('en-IN')}</div>
            <p className="text-[10px] text-neutral-500 font-medium">Completed washes: {stats.completed}</p>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 group-hover:scale-105 transition-transform group-hover:text-white group-hover:border-red-600/25">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-6 bg-[#0c0d12] flex items-center justify-between border-neutral-900 shadow-[0_0_15px_rgba(220,38,38,0.05)] hover:border-red-600/20 group transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">Bay Occupancy</span>
            <div className="text-2xl font-black text-white font-display">
              {appointments.length > 0 ? `${Math.round(((stats.inProgress + stats.completed) / Math.max(appointments.length, 1)) * 100)}%` : "0%"}
            </div>
            <p className="text-[10px] text-neutral-500 font-medium">Efficiency capacity</p>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 group-hover:scale-105 transition-transform group-hover:text-white group-hover:border-red-600/25">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        {/* System Health Status */}
        <Card className="p-6 bg-[#0c0d12] flex items-center justify-between border-neutral-900 shadow-[0_0_15px_rgba(220,38,38,0.05)] hover:border-red-600/20 group transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">Floor Status</span>
            <div className="text-sm font-bold text-red-500 flex items-center gap-1.5 mt-1 font-display">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
              <span>ACTIVE TRACKING</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">REST INTEGRATION SECURE</p>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 group-hover:scale-105 transition-transform group-hover:text-white group-hover:border-red-600/25">
            <Database className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Filters and List Container */}
      <Card className="p-0 overflow-hidden bg-neutral-900/20 border-neutral-850">
        {/* Table Filters Bar */}
        <div className="p-5 border-b border-neutral-850 bg-neutral-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search plate, client, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-neutral-600 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-neutral-950/60 px-3 py-1.5 rounded-lg border border-neutral-850 text-xs shrink-0">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-neutral-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Service Filter */}
            <div className="flex items-center gap-1.5 bg-neutral-950/60 px-3 py-1.5 rounded-lg border border-neutral-850 text-xs shrink-0">
              <Compass className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-transparent border-none text-neutral-300 focus:outline-none max-w-[150px]"
              >
                <option value="all">All Packages</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table Layout */}
        {isLoading ? (
          <div className="p-8">
            <LoadingSkeleton type="table" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-12 px-6">
            <EmptyState
              title="No Appointments Found"
              description={
                searchQuery || statusFilter !== "all" || serviceFilter !== "all"
                  ? "No detailing results matched your filter conditions. Try broadening your query criteria."
                  : "The floor schedule board is completely clear. Floor staff can rest or book a new appointment!"
              }
              icon={Search}
              action={
                (searchQuery || statusFilter !== "all" || serviceFilter !== "all") ? (
                  <Button variant="secondary" size="sm" onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setServiceFilter("all");
                  }}>
                    Reset Filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <Table headers={["Appointment ID", "Client", "Vehicle Specifications", "Package & Price", "Schedule Slot", "Status Check", "Actions"]}>
            {filteredAppointments.map((apt) => {
              const selectedSrv = services.find(s => s.id === apt.serviceId);
              const isDeleting = isDeletingId === apt.id;
              
              return (
                <tr key={apt.id} className="hover:bg-neutral-900/60 transition-all duration-200 group border-b border-neutral-900/40">
                  {/* ID */}
                  <td className="px-5 py-4 font-mono font-bold text-xs text-red-500">
                    #{apt.id}
                  </td>
                  
                  {/* Customer with Initial Avatar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/20 flex items-center justify-center font-black text-white text-xs shadow-[0_0_10px_rgba(220,38,38,0.1)]">
                        {apt.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-white group-hover:text-red-500 transition-colors leading-none">{apt.customerName}</div>
                        <div className="text-[10px] text-neutral-500 font-mono leading-none">{apt.customerPhone}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Vehicle Specs with Mini Brand Badge */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-black bg-neutral-900 text-neutral-300 border border-neutral-800 px-1.5 py-0.5 rounded leading-none uppercase">
                          {apt.vehicleMake}
                        </span>
                        <div className="text-xs text-white leading-none font-bold">
                          {apt.vehicleModel} ({apt.vehicleYear})
                        </div>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        PAINT: {apt.vehicleColor} • <span className="text-red-500 font-bold tracking-wider">{apt.licensePlate}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Service Package */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <div className="text-xs text-neutral-200 leading-none font-semibold uppercase tracking-wide">{selectedSrv?.name || "Wash Package"}</div>
                      <div className="text-xs text-red-500 font-mono font-black leading-none">₹{selectedSrv?.price || 0}</div>
                    </div>
                  </td>
                  
                  {/* Time with calendar outline */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="text-xs text-white leading-none flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-semibold">{apt.date}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-neutral-600" />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Status Dropdown Selector */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full animate-pulse
                        ${apt.status === "completed" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : ""}
                        ${apt.status === "in-progress" ? "bg-sky-500 shadow-[0_0_8px_#0ea5e9]" : ""}
                        ${apt.status === "pending" ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : ""}
                        ${apt.status === "cancelled" ? "bg-neutral-600" : ""}
                      `} />
                      <select
                        value={apt.status}
                        onChange={(e) => handleUpdateStatusInline(apt.id, e.target.value)}
                        className={`text-[10px] font-mono font-bold tracking-wider uppercase border rounded-lg px-2.5 py-1 transition-all focus:outline-none focus:ring-1 focus:ring-red-500/20 cursor-pointer
                          ${apt.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25" : ""}
                          ${apt.status === "in-progress" ? "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/25" : ""}
                          ${apt.status === "pending" ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/25" : ""}
                          ${apt.status === "cancelled" ? "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700" : ""}
                        `}
                      >
                        <option value="pending" className="bg-neutral-950 text-red-400 font-semibold font-mono">Pending</option>
                        <option value="in-progress" className="bg-neutral-950 text-sky-400 font-semibold font-mono">Detailing</option>
                        <option value="completed" className="bg-neutral-950 text-emerald-400 font-semibold font-mono">Completed</option>
                        <option value="cancelled" className="bg-neutral-950 text-neutral-400 font-semibold font-mono">Cancelled</option>
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenView(apt)}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600/30 hover:bg-neutral-950 transition-all"
                        title="View details"
                        aria-label={`View details for ${apt.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(apt)}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600/30 hover:bg-neutral-950 transition-all"
                        title="Edit appointment"
                        aria-label={`Edit ${apt.id}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(apt.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-red-500 hover:text-white hover:bg-red-600 transition-all disabled:opacity-50 shrink-0"
                        title="Delete record"
                        aria-label={`Delete ${apt.id}`}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* MODAL A: Read Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Detailing Record: ${selectedApt?.id}`}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setIsViewOpen(false)}>
            Close Overview
          </Button>
        }
      >
        {selectedApt && (
          <div className="space-y-5">
            {/* Visual vehicle bay scanning header */}
            <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-900/60 relative">
              <OptimizedCarImage 
                src={
                  selectedApt.serviceId === "ceramic-coating" ? "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=650&q=65" :
                  selectedApt.serviceId === "premium-detailing" ? "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=650&q=65" :
                  selectedApt.serviceId === "deluxe-wash" ? "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=650&q=65" :
                  "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=650&q=65"
                } 
                alt="Active bay detailing preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute top-2.5 right-2.5 z-20">
                <Badge variant={selectedApt.status === "completed" ? "success" : "warning"}>
                  {selectedApt.status.toUpperCase()}
                </Badge>
              </div>
              <div className="absolute bottom-2 left-3 z-20 flex items-center gap-1.5 bg-slate-950/85 px-2.5 py-1 rounded border border-cyan-500/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-300">TELEMETRY MONITOR: ACTIVE BAY</span>
              </div>
            </div>

            {/* Owner Profile */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono uppercase text-cyan-500 tracking-wider font-semibold">CUSTOMER PROFILE</h4>
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-850 space-y-2">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-500" />
                  {selectedApt.customerName}
                </div>
                <div className="text-xs text-neutral-400 grid grid-cols-2 gap-2 pl-6">
                  <span>Email: <b className="text-neutral-200">{selectedApt.customerEmail}</b></span>
                  <span>Contact: <b className="text-neutral-200">{selectedApt.customerPhone}</b></span>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">AUTOMOTIVE SPECS</h4>
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-850 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500">Year / Make / Model</span>
                  <p className="text-xs text-neutral-200 font-semibold">{selectedApt.vehicleYear} {selectedApt.vehicleMake} {selectedApt.vehicleModel}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500">License Registration</span>
                  <p className="text-xs font-mono font-bold text-cyan-400 uppercase">{selectedApt.licensePlate}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500">Body Paint Code</span>
                  <p className="text-xs text-neutral-200">{selectedApt.vehicleColor}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500">Scheduled Bay Time</span>
                  <p className="text-xs text-neutral-200">{selectedApt.date} • {selectedApt.time}</p>
                </div>
              </div>
            </div>

            {/* Package details */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">BAY RESERVATION</h4>
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-850 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-white">{selectedServiceDetails?.name}</h5>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Est. treatment duration: {selectedServiceDetails?.duration}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-white">₹{selectedServiceDetails?.price}</div>
                  <Badge variant="neutral">REST API SYNCED</Badge>
                </div>
              </div>
            </div>

            {/* Floor notes */}
            {selectedApt.notes && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">FLOOR OPERATIONAL NOTES</h4>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-850 text-xs italic text-neutral-400 leading-normal">
                  "{selectedApt.notes}"
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL B: Update Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Reservation: ${selectedApt?.id}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-5">
          {/* Section: customer */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              name="customerName"
              value={editForm.customerName}
              onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
              error={editErrors.customerName}
            />
            <Input
              label="Contact Email"
              name="customerEmail"
              value={editForm.customerEmail}
              onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
              error={editErrors.customerEmail}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              name="customerPhone"
              value={editForm.customerPhone}
              onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
              error={editErrors.customerPhone}
            />
            <Select
              label="Appointment Status"
              name="status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              options={[
                { value: "pending", label: "Pending Queue" },
                { value: "in-progress", label: "In Detailing Bay" },
                { value: "completed", label: "Wash Completed" },
                { value: "cancelled", label: "Cancelled" }
              ]}
              error={editErrors.status}
            />
          </div>

          <hr className="border-neutral-850" />

          {/* Section: vehicle */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Vehicle Make"
              name="vehicleMake"
              value={editForm.vehicleMake}
              onChange={(e) => setEditForm({ ...editForm, vehicleMake: e.target.value })}
              error={editErrors.vehicleMake}
            />
            <Input
              label="Vehicle Model"
              name="vehicleModel"
              value={editForm.vehicleModel}
              onChange={(e) => setEditForm({ ...editForm, vehicleModel: e.target.value })}
              error={editErrors.vehicleModel}
            />
            <Input
              label="Model Year"
              name="vehicleYear"
              value={editForm.vehicleYear}
              onChange={(e) => setEditForm({ ...editForm, vehicleYear: e.target.value })}
              error={editErrors.vehicleYear}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Paint Color"
              name="vehicleColor"
              value={editForm.vehicleColor}
              onChange={(e) => setEditForm({ ...editForm, vehicleColor: e.target.value })}
              error={editErrors.vehicleColor}
            />
            <Input
              label="License Plate"
              name="licensePlate"
              value={editForm.licensePlate}
              onChange={(e) => setEditForm({ ...editForm, licensePlate: e.target.value })}
              error={editErrors.licensePlate}
            />
          </div>

          <hr className="border-neutral-850" />

          {/* Section: scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Booking Date"
              name="date"
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              error={editErrors.date}
            />
            <Select
              label="Time Slot"
              name="time"
              value={editForm.time}
              onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
              options={[
                { value: "08:00 AM", label: "08:00 AM" },
                { value: "09:30 AM", label: "09:30 AM" },
                { value: "11:00 AM", label: "11:00 AM" },
                { value: "01:30 PM", label: "01:30 PM" },
                { value: "03:00 PM", label: "03:00 PM" },
                { value: "04:30 PM", label: "04:30 PM" },
                { value: "06:00 PM", label: "06:00 PM" }
              ]}
              error={editErrors.time}
            />
          </div>

          <Select
            label="Service Package"
            name="serviceId"
            value={editForm.serviceId}
            onChange={(e) => setEditForm({ ...editForm, serviceId: e.target.value })}
            options={services.map(s => ({ value: s.id, label: `${s.name} (₹${s.price})` }))}
            error={editErrors.serviceId}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isUpdating}>
              Save Specifications
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
