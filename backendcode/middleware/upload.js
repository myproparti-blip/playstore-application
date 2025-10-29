import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads";

// ✅ Only run folder creation in local development (not in Vercel)
if (process.env.VERCEL !== "1") {
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("✅ Uploads folder created locally");
    }
  } catch (err) {
    console.error("❌ Failed to create uploads folder:", err);
  }
} else {
  console.log("⚠️ Running on Vercel — skipping uploads folder creation");
}

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Prevent disk writes on Vercel
    if (process.env.VERCEL === "1") {
      return cb(
        new Error(
          "❌ File uploads are not supported on Vercel — please use Cloudinary, S3, or another storage service."
        )
      );
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ File Type Filter
const fileFilter = (req, file, cb) => {
  const allowedExt = /\.(jpeg|jpg|png|webp|mp4|mov|mkv|avi)$/i;
  if (allowedExt.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only image/video files are allowed."));
  }
};

// ✅ Initialize Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default upload;
