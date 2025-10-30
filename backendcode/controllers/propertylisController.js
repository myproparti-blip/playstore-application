import Property from "../models/propertyModel.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ Configure Cloudinary (only once globally)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isMasterAdmin = (req) => req.user?.phone === process.env.ADMIN_PHONE;
const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;

// ========================= CREATE PROPERTY =========================
export const createProperty = asyncHandler(async (req, res) => {
  const { title, propertyType, addressLine1, locality, city, price, bedrooms } = req.body;

  if (!title || !addressLine1 || !city || !propertyType || !price || !bedrooms) {
    throw new ApiError(MESSAGES.PROPERTY.REQUIRED_FIELDS, 400);
  }

  // ✅ Upload to Cloudinary
  const images = [];
  const videos = [];

  if (req.files?.images) {
    for (const file of req.files.images) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "properties/images",
      });
      images.push(upload.secure_url);
    }
  }

  if (req.files?.videos) {
    for (const file of req.files.videos) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "properties/videos",
        resource_type: "video",
      });
      videos.push(upload.secure_url);
    }
  }

  // 🧠 Check duplicate
  let property = await Property.findOne({
    user: req.user.id,
    title: title.trim(),
    propertyType,
    addressLine1: addressLine1.trim(),
    locality: locality ? locality.trim() : "",
    city: city.trim(),
    bedrooms,
    price,
  });

  if (property) {
    if (images.length) property.images.push(...images);
    if (videos.length) property.videos.push(...videos);
    Object.assign(property, req.body, { lastUpdated: Date.now() });
    const updatedProperty = await property.save();

    return res.status(200).json({
      success: true,
      message: MESSAGES.PROPERTY.DUPLICATE_FOUND,
      data: updatedProperty,
    });
  }

  property = new Property({
    ...req.body,
    user: req.user.id,
    images,
    videos,
    isApproved: false,
  });

  const savedProperty = await property.save();

  res.status(201).json({
    success: true,
    message: MESSAGES.PROPERTY.ADD_SUCCESS,
    data: savedProperty,
  });
});

// ========================= GET ALL =========================
export const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find().populate("user", "name email phoneNumber");

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SUCCESS,
    data: properties,
  });
});

// ========================= GET BY ID =========================
export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate("user", "name email phoneNumber");
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SINGLE_SUCCESS,
    data: property,
  });
});

// ========================= UPDATE =========================
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (property.user.toString() !== req.user.id && !isAdmin) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);
  }

  // Upload new images/videos to Cloudinary
  if (req.files?.images) {
    for (const file of req.files.images) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "properties/images",
      });
      property.images.push(upload.secure_url);
    }
  }

  if (req.files?.videos) {
    for (const file of req.files.videos) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "properties/videos",
        resource_type: "video",
      });
      property.videos.push(upload.secure_url);
    }
  }

  Object.assign(property, req.body, { lastUpdated: Date.now() });
  const updatedProperty = await property.save();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.UPDATE_SUCCESS,
    data: updatedProperty,
  });
});

// ========================= DELETE =========================
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (property.user.toString() !== req.user.id && !isAdmin) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.DELETE_SUCCESS,
  });
});
