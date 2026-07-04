import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { Appointment, ServicePackage, ApiResponse, ApiError } from "./src/shared/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production" || path.basename(__dirname) === "dist";

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || process.cwd();
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");

// Static services definition
const SERVICES: ServicePackage[] = [
  {
    id: "express-wash",
    name: "Express Wash",
    price: 499,
    duration: "30 mins",
    description: "Quick exterior wash & vacuum cleaning.",
    features: [
      "High-pressure foam shampoo wash",
      "Vacuum cleaning of seats & footwells",
      "Streak-free windsheild & glass wipe",
      "Gloss dressing for tires & alloys"
    ]
  },
  {
    id: "deluxe-wash",
    name: "Deluxe Wash",
    price: 999,
    duration: "60 mins",
    description: "Exterior wash, interior vacuum & dashboard cleaning.",
    features: [
      "Deep active foam hand wash cycle",
      "Full cabin deep vacuum & trunk cleaning",
      "Dashboard cleaning & premium UV dressing",
      "Under-chassis high-pressure clean",
      "AC vent sanitization & refreshing spray"
    ]
  },
  {
    id: "premium-detailing",
    name: "Premium Detailing",
    price: 2499,
    duration: "120 mins",
    description: "Full interior & exterior detailing.",
    features: [
      "Signature clay bar paint decontamination",
      "Orbital machine polish & swirl correction",
      "Deep upholstery hot vapor steam wash",
      "Leather seats deep hydration & conditioning",
      "Premium wheel barrels and exhaust tip clean"
    ]
  },
  {
    id: "ceramic-coating",
    name: "Ceramic Coating",
    price: 6999,
    duration: "180 mins",
    description: "Paint protection with ceramic coating.",
    features: [
      "Multi-stage machine paint compound correction",
      "Ultra-durable 9H nano-ceramic coating layer",
      "Liquid-gloss hydrophobic water-beading coat",
      "Alloy wheel rim & windshield glass coating",
      "Premium 3M paint protective wax sealer"
    ]
  }
];

// Seed appointments if JSON file doesn't exist
const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-101",
    customerName: "Elizabeth Vance",
    customerEmail: "elizabeth@vanceholding.com",
    customerPhone: "(415) 555-0192",
    vehicleMake: "Porsche",
    vehicleModel: "911 Carrera S",
    vehicleYear: 2024,
    vehicleColor: "GT Silver Metallic",
    licensePlate: "911-LUX",
    serviceId: "ceramic-coating",
    date: "2026-07-03",
    time: "09:00 AM",
    status: "pending",
    notes: "Please pay extra attention to the rear spoiler. Hand dry only.",
    createdAt: new Date().toISOString()
  },
  {
    id: "apt-102",
    customerName: "Marcus Sterling",
    customerEmail: "m.sterling@sterlingcap.com",
    customerPhone: "(212) 555-3398",
    vehicleMake: "Tesla",
    vehicleModel: "Model S Plaid",
    vehicleYear: 2025,
    vehicleColor: "Solid Black",
    licensePlate: "PLAID-X",
    serviceId: "premium-detailing",
    date: "2026-07-03",
    time: "11:30 AM",
    status: "in-progress",
    notes: "No scented deodorant mist, client is sensitive to fragrances.",
    createdAt: new Date().toISOString()
  },
  {
    id: "apt-103",
    customerName: "Sophia Mercer",
    customerEmail: "sophia.mercer@gmail.com",
    customerPhone: "(310) 555-8821",
    vehicleMake: "Land Rover",
    vehicleModel: "Range Rover Sport",
    vehicleYear: 2023,
    vehicleColor: "Charente Grey",
    licensePlate: "ROV-88",
    serviceId: "deluxe-wash",
    date: "2026-07-02",
    time: "02:00 PM",
    status: "completed",
    notes: "Carpet shampooing completed successfully. Customer left highly satisfied.",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "apt-104",
    customerName: "David Kim",
    customerEmail: "david.kim@kimassociates.co",
    customerPhone: "(650) 555-4011",
    vehicleMake: "Audi",
    vehicleModel: "e-tron GT",
    vehicleYear: 2024,
    vehicleColor: "Ascari Blue Metallic",
    licensePlate: "ETRON-G",
    serviceId: "express-wash",
    date: "2026-07-04",
    time: "01:30 PM",
    status: "pending",
    notes: "Fast wash requested before airport run.",
    createdAt: new Date().toISOString()
  }
];

// Helper to read appointments from file
function readAppointments(): Appointment[] {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(APPOINTMENTS_FILE)) {
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(SEED_APPOINTMENTS, null, 2), "utf-8");
      return SEED_APPOINTMENTS;
    }
    const data = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading appointments file:", err);
    return SEED_APPOINTMENTS;
  }
}

// Helper to write appointments to file
function writeAppointments(appointments: Appointment[]): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing appointments file:", err);
  }
}

// HTML XSS Sanitization helper
function sanitizeString(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function sanitizeObject<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    if (typeof obj === "string") {
      return sanitizeString(obj) as any;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as any;
  }
  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObject((obj as any)[key]);
    }
  }
  return sanitized;
}

// Appointment schema validation helper
function validateAppointment(data: any): ApiError[] {
  const errors: ApiError[] = [];
  
  if (!data.customerName || typeof data.customerName !== "string" || data.customerName.trim().length < 2) {
    errors.push({ field: "customerName", code: "INVALID_NAME", message: "Customer name must be at least 2 characters." });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.customerEmail || typeof data.customerEmail !== "string" || !emailRegex.test(data.customerEmail)) {
    errors.push({ field: "customerEmail", code: "INVALID_EMAIL", message: "Please provide a valid email address." });
  }
  
  if (!data.customerPhone || typeof data.customerPhone !== "string" || data.customerPhone.trim().length < 7) {
    errors.push({ field: "customerPhone", code: "INVALID_PHONE", message: "Please provide a valid contact phone number." });
  }
  
  if (!data.vehicleMake || typeof data.vehicleMake !== "string" || data.vehicleMake.trim().length === 0) {
    errors.push({ field: "vehicleMake", code: "MISSING_MAKE", message: "Vehicle make is required." });
  }
  
  if (!data.vehicleModel || typeof data.vehicleModel !== "string" || data.vehicleModel.trim().length === 0) {
    errors.push({ field: "vehicleModel", code: "MISSING_MODEL", message: "Vehicle model is required." });
  }
  
  const yearNum = Number(data.vehicleYear);
  const currentYear = new Date().getFullYear();
  if (!data.vehicleYear || isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
    errors.push({ field: "vehicleYear", code: "INVALID_YEAR", message: `Vehicle year must be between 1900 and ${currentYear + 1}.` });
  }
  
  if (!data.vehicleColor || typeof data.vehicleColor !== "string" || data.vehicleColor.trim().length === 0) {
    errors.push({ field: "vehicleColor", code: "MISSING_COLOR", message: "Vehicle exterior color is required." });
  }
  
  if (!data.licensePlate || typeof data.licensePlate !== "string" || data.licensePlate.trim().length === 0) {
    errors.push({ field: "licensePlate", code: "MISSING_PLATE", message: "License plate is required." });
  }
  
  const validServices = SERVICES.map(s => s.id);
  if (!data.serviceId || typeof data.serviceId !== "string" || !validServices.includes(data.serviceId)) {
    errors.push({ field: "serviceId", code: "INVALID_SERVICE", message: "Please select a valid service package." });
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!data.date || typeof data.date !== "string" || !dateRegex.test(data.date)) {
    errors.push({ field: "date", code: "INVALID_DATE_FORMAT", message: "Date must be in YYYY-MM-DD format." });
  } else {
    const aptDate = new Date(data.date);
    if (isNaN(aptDate.getTime())) {
      errors.push({ field: "date", code: "INVALID_DATE_VALUE", message: "The specified date is invalid." });
    }
  }
  
  if (!data.time || typeof data.time !== "string" || data.time.trim().length === 0) {
    errors.push({ field: "time", code: "MISSING_TIME", message: "Please select an appointment slot time." });
  }

  return errors;
}

async function startServer() {
  const app = express();
  
  // JSON Body Parser with 100kb size limit
  app.use(express.json({ limit: "100kb" }));

  app.get("/healthz", (_req, res) => {
    res.json({
      ok: true,
      environment: isProduction ? "production" : "development"
    });
  });
  
  // API Endpoints
  
  // GET /api/services - list available wash packages
  app.get("/api/services", (req, res) => {
    const response: ApiResponse<ServicePackage[]> = {
      success: true,
      data: SERVICES
    };
    res.json(response);
  });
  
  // GET /api/appointments - list appointments, support search query
  app.get("/api/appointments", (req, res) => {
    const appointments = readAppointments();
    const query = req.query.q ? String(req.query.q).toLowerCase().trim() : "";
    
    let filtered = appointments;
    if (query) {
      filtered = appointments.filter(apt => 
        apt.customerName.toLowerCase().includes(query) ||
        apt.customerEmail.toLowerCase().includes(query) ||
        apt.customerPhone.toLowerCase().includes(query) ||
        apt.vehicleMake.toLowerCase().includes(query) ||
        apt.vehicleModel.toLowerCase().includes(query) ||
        apt.licensePlate.toLowerCase().includes(query) ||
        apt.serviceId.toLowerCase().includes(query) ||
        apt.date.includes(query)
      );
    }
    
    // Sort appointments: pending and in-progress first, then date descending
    filtered.sort((a, b) => {
      const statusPriority: Record<string, number> = { "in-progress": 1, "pending": 2, "completed": 3, "cancelled": 4 };
      const priorityA = statusPriority[a.status] || 5;
      const priorityB = statusPriority[b.status] || 5;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return b.date.localeCompare(a.date);
    });
    
    const response: ApiResponse<Appointment[]> = {
      success: true,
      data: filtered
    };
    res.json(response);
  });
  
  // GET /api/appointments/:id - get appointment by ID
  app.get("/api/appointments/:id", (req, res) => {
    const appointments = readAppointments();
    const appointment = appointments.find(apt => apt.id === req.params.id);
    
    if (!appointment) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        errors: [{ code: "NOT_FOUND", message: `Appointment with ID ${req.params.id} not found.` }]
      };
      return res.status(404).json(errorResponse);
    }
    
    const response: ApiResponse<Appointment> = {
      success: true,
      data: appointment
    };
    res.json(response);
  });
  
  // POST /api/appointments - create a new appointment
  app.post("/api/appointments", (req, res) => {
    // Sanitize the payload recursively against XSS
    const sanitizedBody = sanitizeObject(req.body);
    
    // Validate fields
    const validationErrors = validateAppointment(sanitizedBody);
    if (validationErrors.length > 0) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        errors: validationErrors
      };
      return res.status(400).json(errorResponse);
    }
    
    const appointments = readAppointments();
    
    // Check for double booking conflicts on the same date, time, and service bay (mock capacity is 2 concurrent per slot)
    const duplicateCount = appointments.filter(apt => 
      apt.date === sanitizedBody.date && 
      apt.time === sanitizedBody.time &&
      apt.status !== "cancelled"
    ).length;
    
    if (duplicateCount >= 2) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        errors: [{ 
          field: "time", 
          code: "SLOT_FULLY_BOOKED", 
          message: "The requested time slot on this day is fully booked. Please select another slot." 
        }]
      };
      return res.status(409).json(errorResponse);
    }
    
    // Generate a secure unique ID
    const newId = `apt-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newAppointment: Appointment = {
      id: newId,
      customerName: sanitizedBody.customerName.trim(),
      customerEmail: sanitizedBody.customerEmail.trim(),
      customerPhone: sanitizedBody.customerPhone.trim(),
      vehicleMake: sanitizedBody.vehicleMake.trim(),
      vehicleModel: sanitizedBody.vehicleModel.trim(),
      vehicleYear: Number(sanitizedBody.vehicleYear),
      vehicleColor: sanitizedBody.vehicleColor.trim(),
      licensePlate: sanitizedBody.licensePlate.trim().toUpperCase(),
      serviceId: sanitizedBody.serviceId,
      date: sanitizedBody.date,
      time: sanitizedBody.time,
      status: "pending",
      notes: sanitizedBody.notes ? sanitizedBody.notes.trim() : "",
      createdAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    writeAppointments(appointments);
    
    // Telemetry log
    console.log(`[Analytics] New appointment created: ${newId} | service: ${sanitizedBody.serviceId}`);
    
    const response: ApiResponse<Appointment> = {
      success: true,
      data: newAppointment
    };
    res.status(201).json(response);
  });
  
  // PUT /api/appointments/:id - update appointment
  app.put("/api/appointments/:id", (req, res) => {
    const { id } = req.params;
    const appointments = readAppointments();
    const aptIndex = appointments.findIndex(apt => apt.id === id);
    
    if (aptIndex === -1) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        errors: [{ code: "NOT_FOUND", message: `Appointment with ID ${id} not found.` }]
      };
      return res.status(404).json(errorResponse);
    }
    
    // Sanitize input body
    const sanitizedBody = sanitizeObject(req.body);
    
    // Validate (we support partial updates or full updates)
    // If we are just updating status, we don't validate full body:
    const isStatusOnlyUpdate = Object.keys(sanitizedBody).length === 1 && sanitizedBody.status !== undefined;
    
    if (isStatusOnlyUpdate) {
      const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
      if (!validStatuses.includes(sanitizedBody.status)) {
        const errorResponse: ApiResponse<null> = {
          success: false,
          errors: [{ field: "status", code: "INVALID_STATUS", message: "Invalid status value provided." }]
        };
        return res.status(400).json(errorResponse);
      }
      appointments[aptIndex].status = sanitizedBody.status;
    } else {
      // Validate full form update
      const validationErrors = validateAppointment(sanitizedBody);
      if (validationErrors.length > 0) {
        const errorResponse: ApiResponse<null> = {
          success: false,
          errors: validationErrors
        };
        return res.status(400).json(errorResponse);
      }
      
      appointments[aptIndex] = {
        ...appointments[aptIndex],
        customerName: sanitizedBody.customerName.trim(),
        customerEmail: sanitizedBody.customerEmail.trim(),
        customerPhone: sanitizedBody.customerPhone.trim(),
        vehicleMake: sanitizedBody.vehicleMake.trim(),
        vehicleModel: sanitizedBody.vehicleModel.trim(),
        vehicleYear: Number(sanitizedBody.vehicleYear),
        vehicleColor: sanitizedBody.vehicleColor.trim(),
        licensePlate: sanitizedBody.licensePlate.trim().toUpperCase(),
        serviceId: sanitizedBody.serviceId,
        date: sanitizedBody.date,
        time: sanitizedBody.time,
        notes: sanitizedBody.notes ? sanitizedBody.notes.trim() : "",
        status: sanitizedBody.status || appointments[aptIndex].status
      };
    }
    
    writeAppointments(appointments);
    
    console.log(`[Analytics] Appointment ${id} updated | status: ${appointments[aptIndex].status}`);
    
    const response: ApiResponse<Appointment> = {
      success: true,
      data: appointments[aptIndex]
    };
    res.json(response);
  });
  
  // DELETE /api/appointments/:id - delete appointment
  app.delete("/api/appointments/:id", (req, res) => {
    const { id } = req.params;
    const appointments = readAppointments();
    const aptIndex = appointments.findIndex(apt => apt.id === id);
    
    if (aptIndex === -1) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        errors: [{ code: "NOT_FOUND", message: `Appointment with ID ${id} not found.` }]
      };
      return res.status(404).json(errorResponse);
    }
    
    const deletedApt = appointments.splice(aptIndex, 1)[0];
    writeAppointments(appointments);
    
    console.log(`[Analytics] Appointment ${id} deleted`);
    
    const response: ApiResponse<Appointment> = {
      success: true,
      data: deletedApt
    };
    res.json(response);
  });
  
  // Vite Integration & Middleware for Frontend Assets
  if (!isProduction) {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static compiled UI assets
    app.use(express.static(distPath));
    
    // Fallback everything else to React Index
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  
  // Start Express on required port 3000 and bind to 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the Express fullstack server:", err);
  process.exit(1);
});
