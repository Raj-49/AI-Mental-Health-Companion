import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import prisma from "../prisma/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/profile", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "user_profiles" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { profile_image_url: result.secure_url, updated_at: new Date() },
    });

    res.status(200).json({ success: true, imageUrl: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
});

export default router;
