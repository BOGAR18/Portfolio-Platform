"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/auth.ts
var auth_exports = {};
__export(auth_exports, {
  default: () => auth_default
});
module.exports = __toCommonJS(auth_exports);
var import_express2 = __toESM(require("express"));
var import_cookie_parser = __toESM(require("cookie-parser"));

// server/routes/auth.ts
var import_express = require("express");
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_bcryptjs = __toESM(require("bcryptjs"));

// shared/schemas.ts
var import_zod = require("zod");
var localeSchema = import_zod.z.enum(["en", "id"]).default("en");
var langQuery = import_zod.z.object({ lang: localeSchema });
var contactSchema = import_zod.z.object({
  name: import_zod.z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: import_zod.z.string().trim().email("Format email tidak valid"),
  subject: import_zod.z.string().trim().min(3).max(120),
  message: import_zod.z.string().trim().min(10, "Pesan minimal 10 karakter").max(2e3),
  // Honeypot: kolom ini disembunyikan dari pengunjung. Bot biasanya mengisinya.
  website: import_zod.z.string().max(200).optional()
});
var loginSchema = import_zod.z.object({
  email: import_zod.z.string().trim().email(),
  password: import_zod.z.string().min(1, "Password wajib diisi")
});
var projectInputSchema = import_zod.z.object({
  slug: import_zod.z.string().min(3).max(80).regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  title: import_zod.z.string().trim().min(3).max(120),
  summary: import_zod.z.string().trim().min(10).max(300),
  problem: import_zod.z.string().max(2e3).optional(),
  solution: import_zod.z.string().max(2e3).optional(),
  role: import_zod.z.string().max(120).optional(),
  category: import_zod.z.string().trim().min(2).max(60),
  githubUrl: import_zod.z.string().url().optional().or(import_zod.z.literal("")),
  liveUrl: import_zod.z.string().url().optional().or(import_zod.z.literal("")),
  featured: import_zod.z.boolean().default(false),
  published: import_zod.z.boolean().default(true),
  skills: import_zod.z.array(import_zod.z.string().trim().min(1)).default([]),
  imageUrl: import_zod.z.string().optional().or(import_zod.z.literal("")),
  translations: import_zod.z.object({
    en: import_zod.z.record(import_zod.z.string()).optional(),
    id: import_zod.z.record(import_zod.z.string()).optional()
  }).default({})
});
var listProjectsQuery = import_zod.z.object({
  q: import_zod.z.string().max(100).optional(),
  skill: import_zod.z.string().max(60).optional(),
  sort: import_zod.z.enum(["newest", "title"]).default("newest"),
  lang: localeSchema
});
var chatSchema = import_zod.z.object({
  message: import_zod.z.string().trim().min(2, "Pesan terlalu pendek").max(500, "Pesan maksimal 500 karakter"),
  lang: localeSchema
});
var analyticsSchema = import_zod.z.object({
  type: import_zod.z.enum(["pageview", "cv_download", "contact_click", "project_view"]),
  path: import_zod.z.string().max(200)
});

// server/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// server/lib/env.ts
var import_config = require("dotenv/config");
var import_zod2 = require("zod");
var schema = import_zod2.z.object({
  DATABASE_URL: import_zod2.z.string().min(1),
  PORT: import_zod2.z.coerce.number().default(3001),
  CLIENT_ORIGIN: import_zod2.z.string().default("http://localhost:5173"),
  NODE_ENV: import_zod2.z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: import_zod2.z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  ADMIN_EMAIL: import_zod2.z.string().email(),
  ADMIN_PASSWORD: import_zod2.z.string().min(8),
  ANTHROPIC_API_KEY: import_zod2.z.string().optional(),
  ANTHROPIC_MODEL: import_zod2.z.string().default("claude-haiku-4-5")
});
var env = schema.parse(process.env);

// server/lib/errors.ts
var HttpError = class extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
  status;
  details;
};

// server/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function signToken(user) {
  return import_jsonwebtoken.default.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "7d"
  });
}
function requireAuth(req, _res, next) {
  const token = req.cookies?.token;
  if (!token) return next(new HttpError(401, "Anda belum login"));
  try {
    const payload = import_jsonwebtoken.default.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, "Sesi sudah berakhir, silakan login ulang"));
  }
}

// server/routes/auth.ts
var authRouter = (0, import_express.Router)();
var DUMMY_HASH = import_bcryptjs.default.hashSync("dummy-password", 10);
var loginLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 6e4,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Terlalu banyak percobaan login, coba lagi nanti" } }
});
var cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1e3
};
authRouter.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await import_bcryptjs.default.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, "Email atau password salah");
  const token = signToken({ id: user.id, role: user.role });
  res.cookie("token", token, cookieOptions);
  res.json({ user: { id: user.id, role: user.role } });
});
authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ ok: true });
});
authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// server/middleware/errorHandler.ts
var import_zod3 = require("zod");
function errorHandler(err, _req, res, _next) {
  if (err instanceof import_zod3.ZodError) {
    return res.status(400).json({
      error: { message: "Data tidak valid", details: err.flatten().fieldErrors }
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: { message: "Body JSON tidak valid" } });
  }
  console.error(err);
  return res.status(500).json({ error: { message: "Terjadi kesalahan di server" } });
}

// api/auth.ts
var app = (0, import_express2.default)();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(import_express2.default.json({ limit: "16kb" }));
app.use((0, import_cookie_parser.default)());
app.use("/api/auth", authRouter);
app.use(errorHandler);
var auth_default = app;
