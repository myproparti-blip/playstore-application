import Property from "../models/propertyModel.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";

const isMasterAdmin = (req) => req.user?.phone === process.env.ADMIN_PHONE;

// Helper: Build base URL dynamically
const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;

export const createProperty = asyncHandler(async (req, res) => {
  const { title, propertyType, addressLine1, locality, city, price, bedrooms } = req.body;

  if (!title || !addressLine1 || !city || !propertyType || !price || !bedrooms) {
    throw new ApiError(MESSAGES.PROPERTY.REQUIRED_FIELDS, 400);
  }

  // Save only relative paths for files
  const images = req.files?.images?.map((f) => `/uploads/${f.filename}`) || [];
  const videos = req.files?.videos?.map((f) => `/uploads/${f.filename}`) || [];

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

    const baseUrl = getBaseUrl(req);
    const propertyWithFullUrls = {
      ...updatedProperty.toObject(),
      images: property.images.map((img) => `${baseUrl}${img}`),
      videos: property.videos.map((vid) => `${baseUrl}${vid}`),
    };

    return res.status(200).json({
      success: true,
      message: MESSAGES.PROPERTY.DUPLICATE_FOUND,
      data: propertyWithFullUrls,
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
  const baseUrl = getBaseUrl(req);

  const propertyWithFullUrls = {
    ...savedProperty.toObject(),
    images: images.map((img) => `${baseUrl}${img}`),
    videos: videos.map((vid) => `${baseUrl}${vid}`),
  };

  return res.status(201).json({
    success: true,
    message: MESSAGES.PROPERTY.ADD_SUCCESS,
    data: propertyWithFullUrls,
  });
});

export const getAllProperties = asyncHandler(async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const properties = await Property.find().populate("user", "name email phoneNumber");

  const propertiesWithFullUrls = properties.map((property) => ({
    ...property.toObject(),
    images: property.images.map((img) => `${baseUrl}${img}`),
    videos: property.videos.map((vid) => `${baseUrl}${vid}`),
  }));

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SUCCESS,
    data: propertiesWithFullUrls,
  });
});

export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    "user",
    "name email phoneNumber"
  );

  // ✅ If property not found
  if (!property) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);
  }

  const isAdmin = isMasterAdmin(req);

  // ✅ Safe user ID extraction (won’t crash if user is null)
  const propertyUserId = property.user?._id?.toString();
  const requestUserId = req.user?.id;

  // 🧩 If property isn’t approved, and requester isn’t owner or admin
 
  const baseUrl = getBaseUrl(req);

  const propertyWithFullUrls = {
    ...property.toObject(),
    images: property.images?.map((img) => `${baseUrl}${img}`) || [],
    videos: property.videos?.map((vid) => `${baseUrl}${vid}`) || [],
  };

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SINGLE_SUCCESS,
    data: propertyWithFullUrls,
  });
});



export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (property.user.toString() !== req.user.id && !isAdmin) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);
  }

  if (req.files?.images)
    property.images.push(...req.files.images.map((f) => `/uploads/${f.filename}`));
  if (req.files?.videos)
    property.videos.push(...req.files.videos.map((f) => `/uploads/${f.filename}`));

  Object.assign(property, req.body, { lastUpdated: Date.now() });
  const updatedProperty = await property.save();

  const baseUrl = getBaseUrl(req);
  const updatedWithFullUrls = {
    ...updatedProperty.toObject(),
    images: property.images.map((img) => `${baseUrl}${img}`),
    videos: property.videos.map((vid) => `${baseUrl}${vid}`),
  };

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.UPDATE_SUCCESS,
    data: updatedWithFullUrls,
  });
});

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

export const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (!isAdmin) throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);

  property.isApproved = true;
  property.approvedBy = req.user.id;
  property.approvalDate = Date.now();

  const updatedProperty = await property.save();

  const baseUrl = getBaseUrl(req);
  const propertyWithFullUrls = {
    ...updatedProperty.toObject(),
    images: property.images.map((img) => `${baseUrl}${img}`),
    videos: property.videos.map((vid) => `${baseUrl}${vid}`),
  };

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.APPROVE_SUCCESS,
    data: propertyWithFullUrls,
  });
});
