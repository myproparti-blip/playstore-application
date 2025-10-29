import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads";

// ✅ Only create uploads folder when running locally
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("✅ Uploads folder created locally");
    }
  } catch (err) {
    console.error("❌ Failed to create uploads folder:", err);
  }
} else {
  console.log("⚠️ Running on Vercel — skipping folder creation (read-only filesystem)");
}

// ✅ Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (process.env.VERCEL) {
      // Prevent writing on Vercel
      return cb(new Error("File uploads are not supported on Vercel — use Cloudinary or S3."));
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|webp|mp4|mov|mkv|avi/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
