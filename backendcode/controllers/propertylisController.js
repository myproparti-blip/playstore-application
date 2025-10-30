import Property from "../models/propertyModel.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";

const isMasterAdmin = (req) => req.user?.phone === process.env.ADMIN_PHONE;

// 🧩 Dynamically detect base URL (important for Vercel)
const getBaseUrl = (req) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  return `${protocol}://${req.get("host")}`;
};

// 🏠 Create property
export const createProperty = asyncHandler(async (req, res) => {
  const { title, propertyType, addressLine1, locality, city, price, bedrooms } = req.body;

  if (!title || !addressLine1 || !city || !propertyType || !price || !bedrooms) {
    throw new ApiError(MESSAGES.PROPERTY.REQUIRED_FIELDS, 400);
  }

  // 🖼 Handle files safely (only local env writes)
  const images = req.files?.images?.map((f) => `/uploads/${f.filename}`) || [];
  const videos = req.files?.videos?.map((f) => `/uploads/${f.filename}`) || [];

  // 🔎 Check for duplicate
  let property = await Property.findOne({
    user: req.user.id,
    title: title.trim(),
    propertyType,
    addressLine1: addressLine1.trim(),
    city: city.trim(),
    bedrooms,
    price,
  });

  const baseUrl = getBaseUrl(req);

  if (property) {
    if (images.length) property.images.push(...images);
    if (videos.length) property.videos.push(...videos);
    Object.assign(property, req.body, { lastUpdated: Date.now() });
    const updatedProperty = await property.save();

    return res.status(200).json({
      success: true,
      message: MESSAGES.PROPERTY.DUPLICATE_FOUND,
      data: {
        ...updatedProperty.toObject(),
        images: property.images.map((i) => `${baseUrl}${i}`),
        videos: property.videos.map((v) => `${baseUrl}${v}`),
      },
    });
  }

  // 🆕 Create new
  const newProperty = new Property({
    ...req.body,
    user: req.user.id,
    images,
    videos,
    isApproved: false,
  });

  const saved = await newProperty.save();

  res.status(201).json({
    success: true,
    message: MESSAGES.PROPERTY.ADD_SUCCESS,
    data: {
      ...saved.toObject(),
      images: images.map((i) => `${baseUrl}${i}`),
      videos: videos.map((v) => `${baseUrl}${v}`),
    },
  });
});

// 📋 Get all
export const getAllProperties = asyncHandler(async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const properties = await Property.find().populate("user", "name email phoneNumber");

  const formatted = properties.map((p) => ({
    ...p.toObject(),
    images: p.images.map((i) => `${baseUrl}${i}`),
    videos: p.videos.map((v) => `${baseUrl}${v}`),
  }));

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SUCCESS,
    data: formatted,
  });
});

// 🔍 Get by ID
export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate("user", "name email phoneNumber");
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const baseUrl = getBaseUrl(req);

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SINGLE_SUCCESS,
    data: {
      ...property.toObject(),
      images: property.images?.map((i) => `${baseUrl}${i}`) || [],
      videos: property.videos?.map((v) => `${baseUrl}${v}`) || [],
    },
  });
});

// ✏️ Update
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (property.user.toString() !== req.user.id && !isAdmin)
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);

  if (req.files?.images)
    property.images.push(...req.files.images.map((f) => `/uploads/${f.filename}`));
  if (req.files?.videos)
    property.videos.push(...req.files.videos.map((f) => `/uploads/${f.filename}`));

  Object.assign(property, req.body, { lastUpdated: Date.now() });
  const updated = await property.save();

  const baseUrl = getBaseUrl(req);

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.UPDATE_SUCCESS,
    data: {
      ...updated.toObject(),
      images: updated.images.map((i) => `${baseUrl}${i}`),
      videos: updated.videos.map((v) => `${baseUrl}${v}`),
    },
  });
});

// 🗑 Delete
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (property.user.toString() !== req.user.id && !isAdmin)
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.DELETE_SUCCESS,
  });
});

// ✅ Approve
export const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (!isAdmin) throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);

  property.isApproved = true;
  property.approvedBy = req.user.id;
  property.approvalDate = Date.now();

  const updated = await property.save();

  const baseUrl = getBaseUrl(req);

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.APPROVE_SUCCESS,
    data: {
      ...updated.toObject(),
      images: updated.images.map((i) => `${baseUrl}${i}`),
      videos: updated.videos.map((v) => `${baseUrl}${v}`),
    },
  });
});
