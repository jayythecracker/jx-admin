import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { filterUserSchema, updateUserSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all users with filtering and pagination
  app.get("/api/users", async (req, res) => {
    try {
      const parsedQuery = filterUserSchema.parse({
        name: req.query.name as string | undefined,
        phone: req.query.phone as string | undefined,
        is_vip: req.query.is_vip as string | undefined,
        is_banned: req.query.is_banned as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });

      const result = await storage.getUsers(parsedQuery);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
      }
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userData = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.params.id, userData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });

  // Ban user
  app.post("/api/users/:id/ban", async (req, res) => {
    try {
      const updatedUser = await storage.banUser(req.params.id);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  // Unban user
  app.post("/api/users/:id/unban", async (req, res) => {
    try {
      const updatedUser = await storage.unbanUser(req.params.id);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ message: "Failed to unban user" });
    }
  });

  // Set VIP status
  app.post("/api/users/:id/vip", async (req, res) => {
    try {
      const { isVip } = req.body;
      if (typeof isVip !== "boolean") {
        return res.status(400).json({ message: "isVip must be a boolean" });
      }
      
      const updatedUser = await storage.setVipStatus(req.params.id, isVip);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error setting VIP status:", error);
      res.status(500).json({ message: "Failed to update VIP status" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", async (_req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  app.get("/api/analytics/activity", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const activityData = await storage.getUserActivityTrend(days);
      res.json(activityData);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity data" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch application settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const updatedSettings = await storage.updateSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update application settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
