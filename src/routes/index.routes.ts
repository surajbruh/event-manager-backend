import { Router } from "express";
import type { Request, Response } from "express";
import authRouter from "./auth.routes.js";
import eventsRouter from "./events.routes.js";
import { upload } from "../middleware/multer.middleware.js";
import { supabase } from "../supbase.config.js";
import { generateFilename } from "../utils.js";

const router = Router();

router.use("/api/auth", authRouter);
router.use("/api/events", eventsRouter);

router
  .route("/")
  .get(async (request: Request, response: Response) => {
    try {
      response.status(200).json("Hello world!");
    } catch (error) {
      throw error;
    }
  })
  .post(
    upload.single("image"),
    async (request: Request, response: Response) => {
      try {
        const file = request.file;
        if (!file)
          return response.status(400).json({ error: "No file uploaded." });

        // Generate a unique filename to prevent overwriting existing assets
        const fileName = generateFilename(file);

        const { data, error } = await supabase.storage
          .from("images")
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) return response.status(500).json({ error: error.message });

        const { data: publicURLData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        response.status(200).json({
          message: "Image uploaded successfully!",
          filePath: data.path,
          publicUrl: publicURLData.publicUrl,
        });
      } catch (error) {
        console.error(error);
        response.status(500).json({ success: false });
      }
    },
  );

router.get("/health", (request: Request, response: Response) => {
  response.status(200).json({ status: "UP", uptime: process.uptime() });
});

export default router;
