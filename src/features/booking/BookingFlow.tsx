import * as React from "react";
import { Sparkles, Calendar, CalendarDays, Car, CheckCircle2, ChevronRight, ChevronLeft, Clock, AlertTriangle, CreditCard, ClipboardCheck } from "lucide-react";
import { Button, Card, Input, Badge, LoadingSkeleton, OptimizedCarImage } from "../../shared/ui/UiComponents";
import { ServicePackage, Appointment, ApiResponse } from "../../shared/types";

interface BookingFlowProps {
  services: ServicePackage[];
  onAddToast: (type: "success" | "error" | "info", message: string, description?: string) => void;
  onBookingSuccess: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ services, onAddToast, onBookingSuccess, onNavigateToTab }) => {
  const defaultFormData = {
    serviceId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "2024",
    vehicleColor: "",
    licensePlate: "",
    date: "",
    time: "11:00 AM",
    notes: ""
  };

  // Wizard steps: 1 = service, 2 = vehicle, 3 = date/time, 4 = review, 5 = confirmed
  const [step, setStep] = React.useState<number>(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    const savedStep = Number(sessionStorage.getItem("bookingStep"));
    return Number.isInteger(savedStep) && savedStep >= 1 && savedStep <= 5 ? savedStep : 1;
  });
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  
  // Form State
  const [formData, setFormData] = React.useState(() => {
    if (typeof window === "undefined") {
      return defaultFormData;
    }

    const savedFormData = sessionStorage.getItem("bookingFormData");
    if (!savedFormData) {
      return defaultFormData;
    }

    try {
      return { ...defaultFormData, ...JSON.parse(savedFormData) };
    } catch {
      return defaultFormData;
    }
  });

  const sanitizeTextInput = (value: string) => value.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
  const sanitizeSubmittedText = (value: string) => sanitizeTextInput(value).trim();

  const trackAnalytics = () => {
    console.info("[Analytics] User progressed through booking wizard");
  };

  // Pre-fill from landing page quick booking form
  React.useEffect(() => {
    const qs = sessionStorage.getItem("quickService");
    const qp = sessionStorage.getItem("quickPlate");
    const qd = sessionStorage.getItem("quickDate");

    if (qs || qp || qd) {
      // Clean up values from storage so it won't trigger next time
      sessionStorage.removeItem("quickService");
      sessionStorage.removeItem("quickPlate");
      sessionStorage.removeItem("quickDate");

      let plateModel = qp || "";
      let make = "";
      let model = "";
      if (plateModel.includes("(")) {
        // e.g. "KA-01-AB-1234 (Fortuner)"
        const parts = plateModel.split("(");
        plateModel = parts[0].trim();
        const m = parts[1].replace(")", "").trim();
        model = m;
        // Guess a common make
        if (m.toLowerCase().includes("fortuner") || m.toLowerCase().includes("innova")) {
          make = "Toyota";
        } else if (m.toLowerCase().includes("creta") || m.toLowerCase().includes("i20")) {
          make = "Hyundai";
        } else if (m.toLowerCase().includes("city") || m.toLowerCase().includes("civic")) {
          make = "Honda";
        } else {
          make = "Premium";
        }
      }

      setFormData(prev => ({
        ...prev,
        serviceId: qs || prev.serviceId || "ceramic-coating",
        licensePlate: plateModel || prev.licensePlate,
        vehicleModel: model || prev.vehicleModel,
        vehicleMake: make || prev.vehicleMake,
        date: qd || prev.date
      }));
      
      // Auto move to vehicle step since they already chose service and date!
      setStep(2);
    }
  }, [services]);

  React.useEffect(() => {
    sessionStorage.setItem("bookingStep", String(step));
  }, [step]);

  React.useEffect(() => {
    sessionStorage.setItem("bookingFormData", JSON.stringify(formData));
  }, [formData]);

  // Form Validation Errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset booking form
  const handleReset = () => {
    sessionStorage.removeItem("bookingStep");
    sessionStorage.removeItem("bookingFormData");
    setFormData(defaultFormData);
    setErrors({});
    setStep(1);
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  // Time Slot Options
  const timeSlots = [
    "08:00 AM", "09:30 AM", "11:00 AM", "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeTextInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.serviceId) {
      errs.serviceId = "Please select a service package to proceed.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation (Vehicle Info & Owner details)
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      errs.customerName = "Customer name is required.";
    } else if (formData.customerName.trim().length < 2) {
      errs.customerName = "Name must be at least 2 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim()) {
      errs.customerEmail = "Email address is required.";
    } else if (!emailRegex.test(formData.customerEmail)) {
      errs.customerEmail = "Please enter a valid email address.";
    }

    if (!formData.customerPhone.trim()) {
      errs.customerPhone = "Contact phone number is required.";
    }

    if (!formData.vehicleMake.trim()) {
      errs.vehicleMake = "Vehicle brand is required.";
    }
    if (!formData.vehicleModel.trim()) {
      errs.vehicleModel = "Vehicle model is required.";
    }
    
    const yearNum = Number(formData.vehicleYear);
    const currentYear = new Date().getFullYear();
    if (!formData.vehicleYear) {
      errs.vehicleYear = "Vehicle model year is required.";
    } else if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      errs.vehicleYear = `Year must be between 1900 and ${currentYear + 1}.`;
    }

    if (!formData.vehicleColor.trim()) {
      errs.vehicleColor = "Vehicle paint color is required.";
    }
    if (!formData.licensePlate.trim()) {
      errs.licensePlate = "License plate number is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation (Date & Time Selection)
  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.date) {
      errs.date = "Please select an appointment date.";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        errs.date = "Appointment date cannot be in the past.";
      }
    }

    if (!formData.time) {
      errs.time = "Please choose a preferred time slot.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      trackAnalytics();
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      trackAnalytics();
    } else if (step === 3 && validateStep3()) {
      setStep(4);
      trackAnalytics();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // Final submit to Express REST API
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        customerName: sanitizeSubmittedText(formData.customerName),
        customerEmail: sanitizeSubmittedText(formData.customerEmail),
        customerPhone: sanitizeSubmittedText(formData.customerPhone),
        vehicleMake: sanitizeSubmittedText(formData.vehicleMake),
        vehicleModel: sanitizeSubmittedText(formData.vehicleModel),
        vehicleColor: sanitizeSubmittedText(formData.vehicleColor),
        licensePlate: sanitizeSubmittedText(formData.licensePlate),
        notes: sanitizeSubmittedText(formData.notes),
        vehicleYear: Number(formData.vehicleYear)
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resJson: ApiResponse<Appointment> = await response.json();

      if (response.status === 201 && resJson.success && resJson.data) {
        onAddToast("success", "Appointment Confirmed!", `Successfully booked ${selectedService?.name} for ${formData.customerName}.`);
        trackAnalytics();
        setStep(5); // Show success screen
        onBookingSuccess(); // Refresh active appointments in admin
      } else if (response.status === 409) {
        // Double booking conflict error
        setStep(3); // Send back to schedule step
        const conflictErr = resJson.errors?.[0];
        setErrors({ time: conflictErr?.message || "Time slot fully booked. Please choose another." });
        onAddToast("error", "Slot Conflict Detected", "The selected time slot is already fully reserved. Please pick another time.");
      } else if (resJson.errors) {
        // Input validation errors
        const newErrs: Record<string, string> = {};
        resJson.errors.forEach(err => {
          if (err.field) {
            newErrs[err.field] = err.message;
          }
        });
        setErrors(newErrs);
        
        // Find which step has errors and jump there
        if (newErrs.serviceId) {
          setStep(1);
        } else if (newErrs.date || newErrs.time) {
          setStep(3);
        } else {
          setStep(2);
        }

        onAddToast("error", "Form Validation Failed", "Please review and correct the highlighted fields in red.");
      } else {
        throw new Error("Unknown server error");
      }
    } catch (err) {
      console.error("Booking submit error:", err);
      onAddToast("error", "Connection Interrupted", "A network timeout occurred. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-5 sm:px-8">
      {/* Wizard Header Progress Bar */}
      {step < 5 && (
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-4">
            <span className={step >= 1 ? "text-red-500 font-bold font-mono" : ""}>1. SERVICE</span>
            <span className={step >= 2 ? "text-red-500 font-bold font-mono" : ""}>2. SPECIFICATIONS</span>
            <span className={step >= 3 ? "text-red-500 font-bold font-mono" : ""}>3. SCHEDULING</span>
            <span className={step >= 4 ? "text-red-500 font-bold font-mono" : ""}>4. CONFIRMATION</span>
          </div>
          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-rose-700 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Stepper Wrapper */}
      {isSubmitting ? (
        <Card className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-[#0c0d12]">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-neutral-900 rounded-full" />
            <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <Sparkles className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white">Transmitting Appointment Securely...</h3>
          <p className="text-xs text-neutral-400 max-w-sm">Checking bay availability, sanitizing payload values, and persisting reservation details to full-stack Express service.</p>
          <div className="w-full max-w-md pt-4">
            <LoadingSkeleton type="form" />
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* STEP 1: Select Service Package */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Select Detailing Package</h2>
                <p className="text-xs text-neutral-400">Choose an enterprise-level car care service. Click on any package to proceed.</p>
              </div>

              {errors.serviceId && (
                <div className="flex items-center gap-2.5 p-4 border border-red-500/20 bg-red-950/20 text-red-300 text-xs rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errors.serviceId}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((srv) => {
                  const isSelected = formData.serviceId === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, serviceId: srv.id }));
                        if (errors.serviceId) setErrors({});
                      }}
                      className={`text-left p-6 rounded-xl border transition-all duration-300 flex flex-col justify-between
                        ${isSelected 
                          ? "bg-red-500/5 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.15)]" 
                          : "bg-slate-950/60 border-slate-900 hover:border-red-500/20 hover:bg-slate-900/40"
                        }`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            {srv.name}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-red-500" />}
                          </h3>
                          <span className="text-base font-black text-red-500">₹{srv.price}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mb-4 leading-normal">{srv.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase pt-4 border-t border-neutral-850/60 w-full">
                        <span>Duration: {srv.duration}</span>
                        <span className={isSelected ? "text-red-500 font-bold" : "text-neutral-500"}>
                          {isSelected ? "Selected" : "Click to Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-neutral-900">
                <Button variant="primary" size="md" icon={ChevronRight} iconPosition="right" onClick={handleNextStep}>
                  Continue to Specifications
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Vehicle Specs & Owner Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Vehicle Specifications & Customer Details</h2>
                <p className="text-xs text-neutral-400">Please record the luxury auto specs and floor contact info. Fields highlighted with * are mandatory.</p>
              </div>

              <Card className="p-6 sm:p-8 space-y-6 bg-neutral-900/40">
                {/* Section A: Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Customer & Owner Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Customer Full Name *"
                      name="customerName"
                      placeholder="e.g. Elizabeth Vance"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      error={errors.customerName}
                    />
                    <Input
                      label="Email Address *"
                      name="customerEmail"
                      type="email"
                      placeholder="e.g. elizabeth@vanceholding.com"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      error={errors.customerEmail}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Contact Phone Number *"
                      name="customerPhone"
                      placeholder="e.g. (415) 555-0192"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      error={errors.customerPhone}
                    />
                    <div className="flex flex-col gap-1.5 justify-end">
                      {/* Placeholder to balance grid */}
                    </div>
                  </div>
                </div>

                <hr className="border-neutral-850" />

                {/* Section B: Vehicle Specifications */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Car className="w-3.5 h-3.5" />
                    Vehicle Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Input
                      label="Vehicle Make *"
                      name="vehicleMake"
                      placeholder="e.g. Porsche"
                      value={formData.vehicleMake}
                      onChange={handleInputChange}
                      error={errors.vehicleMake}
                    />
                    <Input
                      label="Vehicle Model *"
                      name="vehicleModel"
                      placeholder="e.g. 911 Carrera S"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      error={errors.vehicleModel}
                    />
                    <Input
                      label="Model Year *"
                      name="vehicleYear"
                      placeholder="e.g. 2024"
                      value={formData.vehicleYear}
                      onChange={handleInputChange}
                      error={errors.vehicleYear}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Paint Color *"
                      name="vehicleColor"
                      placeholder="e.g. GT Silver Metallic"
                      value={formData.vehicleColor}
                      onChange={handleInputChange}
                      error={errors.vehicleColor}
                    />
                    <Input
                      label="License Plate *"
                      name="licensePlate"
                      placeholder="e.g. 911-LUX"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      error={errors.licensePlate}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-between pt-4 border-t border-neutral-900">
                <Button variant="secondary" size="md" icon={ChevronLeft} onClick={handlePrevStep}>
                  Back
                </Button>
                <Button variant="primary" size="md" icon={ChevronRight} iconPosition="right" onClick={handleNextStep}>
                  Continue to Scheduling
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Scheduling (Date & Time) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Select Date & Time Slot</h2>
                <p className="text-xs text-neutral-400">Available detail bays are reserved under high efficiency. Double-booking check runs instantly in the background.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Date Picker Input (40% width on md) */}
                <Card className="md:col-span-5 p-6 bg-neutral-900/40 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-white" />
                    Select Appointment Date
                  </h3>
                  <Input
                    label="Booking Date *"
                    name="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={handleInputChange}
                    error={errors.date}
                  />
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    * Booking bays are open Monday to Sunday, 8:00 AM to 7:00 PM. Same-day appointments must be booked at least 2 hours in advance.
                  </p>
                </Card>

                {/* Time Slot Grid (60% width on md) */}
                <Card className="md:col-span-7 p-6 bg-neutral-900/40 space-y-4">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Available Detailing Slots
                  </h3>
                  {errors.time && (
                    <div className="flex items-center gap-2 p-3 border border-red-500/20 bg-red-950/20 text-red-300 text-xs rounded-lg">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errors.time}</span>
                    </div>
                  )}

                  {!formData.date ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-950/20">
                      <Calendar className="w-6 h-6 text-neutral-600 mb-2" />
                      <p className="text-xs text-neutral-500">Please select an appointment date first to show active hourly time slots.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {timeSlots.map((slot) => {
                        const isSelected = formData.time === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, time: slot }));
                              if (errors.time) setErrors({});
                            }}
                            className={`py-3.5 px-3 border rounded-lg text-xs font-semibold text-center transition-all duration-250
                              ${isSelected 
                                ? "bg-gradient-to-r from-red-600 to-rose-700 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.35)] font-bold" 
                                : "bg-slate-900/60 border-slate-900 text-neutral-300 hover:border-red-500/20"
                              }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              <div className="flex justify-between pt-4 border-t border-neutral-900">
                <Button variant="secondary" size="md" icon={ChevronLeft} onClick={handlePrevStep}>
                  Back
                </Button>
                <Button variant="primary" size="md" icon={ChevronRight} iconPosition="right" onClick={handleNextStep}>
                  Review Appointment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Confirm Summary */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Review Your Appointment</h2>
                <p className="text-xs text-neutral-400">Please inspect your luxury car wash details before finalizing. Total price is authoritative.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Detail Overview Card */}
                <div className="md:col-span-8 space-y-6">
                  <Card className="p-6 sm:p-8 space-y-6 bg-neutral-900/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Customer Summary */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">CLIENT & CONTACT</h4>
                        <p className="text-sm font-bold text-white leading-tight">{formData.customerName}</p>
                        <p className="text-xs text-neutral-300">{formData.customerEmail}</p>
                        <p className="text-xs text-neutral-400">{formData.customerPhone}</p>
                      </div>

                      {/* Vehicle Summary */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">VEHICLE DETAILS</h4>
                        <p className="text-sm font-bold text-white leading-tight">
                          {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
                        </p>
                        <p className="text-xs text-neutral-300">Paint: {formData.vehicleColor}</p>
                        <div className="pt-1.5">
                          <Badge variant="neutral">Plate: {formData.licensePlate}</Badge>
                        </div>
                      </div>
                    </div>

                    <hr className="border-neutral-850" />

                    {/* Schedule Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">SCHEDULED DATE</h4>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-500" />
                          {formData.date}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">CHOSEN BAY TIME</h4>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          {formData.time}
                        </p>
                      </div>
                    </div>

                    <hr className="border-neutral-850" />

                    {/* Additional Notes input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="notes-area" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Special Instructions / Floor Notes (Optional)
                      </label>
                      <textarea
                        id="notes-area"
                        name="notes"
                        rows={3}
                        placeholder="e.g. Please avoid interior wet washing near electronic displays, fragile custom components, or hand wash paint only."
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-800 text-sm rounded-lg p-3 outline-none text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                      />
                    </div>
                  </Card>
                </div>

                 {/* Bill Calculator Card */}
                <Card className="md:col-span-4 p-6 bg-red-500/5 border border-red-500/20 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-red-500 tracking-wider font-semibold mb-2">Selected Package</h4>
                    <h3 className="text-base font-bold text-white leading-tight">{selectedService?.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1">Est. Duration: {selectedService?.duration}</p>
                  </div>

                  <hr className="border-neutral-800" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Detail Service Base</span>
                      <span className="font-semibold text-neutral-200">₹{selectedService?.price}.00</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Eco-Water Reclamation Fee</span>
                      <span className="font-semibold text-neutral-200">FREE</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Nano-Ceramic Upgrade</span>
                      <span className="font-semibold text-neutral-200">Included</span>
                    </div>
                    <hr className="border-neutral-800" />
                    <div className="flex justify-between text-sm pt-2">
                      <span className="font-semibold text-white">Total Charge</span>
                      <span className="font-extrabold text-red-500 text-lg">₹{selectedService?.price}.00</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 flex items-start gap-2 text-[10px] text-neutral-400 leading-normal">
                    <CreditCard className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>No card needed to book. Floor payments handled post-wash via Cash, Card, or Apple Pay.</span>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between pt-4 border-t border-neutral-900">
                <Button variant="secondary" size="md" icon={ChevronLeft} onClick={handlePrevStep}>
                  Back
                </Button>
                <Button variant="primary" size="lg" icon={CheckCircle2} type="submit">
                  Confirm & Schedule Detail
                </Button>
              </div>
            </form>
          )}

          {/* STEP 5: Success Confirmed Screen */}
          {step === 5 && (
            <Card className="p-6 sm:p-8 text-center max-w-xl mx-auto space-y-6 border-red-500/20 bg-neutral-900/40 relative overflow-hidden">
              {/* Overlay glow */}
              <div className="absolute inset-0 radial-glow opacity-30 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                {/* Micro-animating Supercar confirmation badge */}
                <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-slate-900/60 relative">
                  <OptimizedCarImage 
                    src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=650&q=65" 
                    alt="Success supercar bay detail" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-950/85 border border-red-500/30 rounded-full px-3 py-1 flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-500">BAY-01 SCHEDULER SYNCED</span>
                  </div>
                </div>

                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Luxury Detail Confirmed</h2>
                  <p className="text-[11px] text-neutral-400 leading-normal max-w-sm mx-auto">Your reservation has been fully broadcasted to the LuxeWash active floor telemetry system.</p>
                </div>

                <div className="p-5 bg-neutral-950/80 border border-neutral-850 rounded-xl space-y-3 text-left">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 font-mono tracking-wider">CLIENT</span>
                    <span className="text-white font-bold">{formData.customerName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 font-mono tracking-wider">VEHICLE SPECS</span>
                    <span className="text-white font-bold">{formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 font-mono tracking-wider">SERVICE FORMULA</span>
                    <span className="text-red-500 font-black">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 font-mono tracking-wider">CHOSEN BAY SCHEDULE</span>
                    <span className="text-white font-bold">{formData.date} @ {formData.time}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                  <Button variant="secondary" size="md" onClick={handleReset}>
                    Book Another Vehicle
                  </Button>
                  <Button variant="primary" size="md" onClick={() => onNavigateToTab("dashboard")}>
                    Go to Floor Schedule
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
