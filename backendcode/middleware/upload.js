import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine folder and type
    let folder = "consultants";
    let resource_type = "image";

    if (file.mimetype.startsWith("video/")) {
      resource_type = "video";
      folder = "consultant_videos";
    }

    return {
      folder,
      resource_type,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      transformation:
        resource_type === "image"
          ? [{ width: 800, height: 800, crop: "limit" }]
          : undefined,
    };
  },
});

// ✅ File Type Filter
const fileFilter = (req, file, cb) => {
  const allowedExt = /\.(jpeg|jpg|png|webp|mp4|mov|mkv|avi)$/i;
  if (allowedExt.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only image and video files are allowed."));
  }
};

// ✅ Initialize Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export default upload;