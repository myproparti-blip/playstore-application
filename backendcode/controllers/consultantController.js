import mongoose from "mongoose";
import consultantModel from "../models/consultantModel.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";

const isMasterAdmin = (req) => req.user?.phone === process.env.ADMIN_PHONE;

// Helper function to get base URL
const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get('host')}`;
};

export const getConsultants = asyncHandler(async (req, res) => {
  const { location } = req.query;
  const filter = location ? { location: { $regex: location, $options: "i" } } : {};
  const baseUrl = getBaseUrl(req);

  try {
    const consultants = await consultantModel.find(filter).sort({ createdAt: -1 });
    
    // Transform consultants to include full image URLs
    const consultantsWithFullUrls = consultants.map(consultant => ({
      ...consultant.toObject(),
      image: consultant.image ? `${baseUrl}${consultant.image}` : null,
      idProof: consultant.idProof ? `${baseUrl}${consultant.idProof}` : null
    }));

    res.status(200).json({
      success: true,
      message: MESSAGES.CONSULTANT.FETCH_SUCCESS,
      data: consultantsWithFullUrls,
    });
  } catch (error) {
    throw new ApiError(MESSAGES.CONSULTANT.FETCH_FAIL, 500);
  }
});

export const getConsultantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const baseUrl = getBaseUrl(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid consultant ID", 400);
  }

  const consultant = await consultantModel.findById(id);
  if (!consultant) throw new ApiError(MESSAGES.CONSULTANT.NOT_FOUND, 404);

  // Add full URLs to image paths
  const consultantWithFullUrls = {
    ...consultant.toObject(),
    image: consultant.image ? `${baseUrl}${consultant.image}` : null,
    idProof: consultant.idProof ? `${baseUrl}${consultant.idProof}` : null
  };

  res.status(200).json({
    success: true,
    message: MESSAGES.CONSULTANT.FETCH_SUCCESS,
    data: consultantWithFullUrls,
  });
});

export const addConsultant = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    designation,
    experience,
    money,
    moneyType,
    expertise,
    languages,
    address,
    location,
  } = req.body;
  const baseUrl = getBaseUrl(req);

  if (
    !name ||
    !phone ||
    !designation ||
    experience === undefined ||
    !money ||
    !expertise ||
    !location ||
    !req.files?.image?.[0] ||
    !req.files?.idProof?.[0]
  ) {
    throw new ApiError(MESSAGES.CONSULTANT.REQUIRED_FIELDS, 400);
  }

  // Validate moneyType
  if (moneyType && !["minute", "hour", "project"].includes(moneyType)) {
    throw new ApiError("Invalid moneyType. Must be 'minute', 'hour', or 'project'", 400);
  }

  const existing = await consultantModel.findOne({
    name: name.trim(),
    phone: phone.trim(),
  });
  if (existing) throw new ApiError(MESSAGES.CONSULTANT.EXISTS, 400);

  const imagePath = `/uploads/${req.files.image[0].filename}`;
  const idProofPath = `/uploads/${req.files.idProof[0].filename}`;

  const formattedLanguages = Array.isArray(languages)
    ? languages
    : typeof languages === "string"
    ? languages.split(",").map((l) => l.trim())
    : [];

  try {
    const consultant = await consultantModel.create({
      name: name.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      experience,
      money,
      moneyType: moneyType || "project",
      expertise: expertise.trim(),
      certifications: "",
      languages: formattedLanguages,
      image: imagePath,
      idProof: idProofPath,
      address: address?.trim() || "",
      location: location.trim(),
      user: req.user?.id || null,
    });

    // Return consultant with full URLs
    const consultantWithFullUrls = {
      ...consultant.toObject(),
      image: `${baseUrl}${imagePath}`,
      idProof: `${baseUrl}${idProofPath}`
    };

    res.status(201).json({
      success: true,
      message: MESSAGES.CONSULTANT.ADD_SUCCESS,
      data: consultantWithFullUrls,
    });
  } catch (error) {
    throw new ApiError(MESSAGES.CONSULTANT.ADD_FAIL, 500);
  }
});

export const updateConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const baseUrl = getBaseUrl(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid consultant ID", 400);
  }

  const consultant = await consultantModel.findById(id);
  if (!consultant) throw new ApiError(MESSAGES.CONSULTANT.NOT_FOUND, 404);

  if (!isMasterAdmin(req) && consultant.user?.toString() !== req.user.id) {
    throw new ApiError(MESSAGES.CONSULTANT.NOT_AUTHORIZED, 403);
  }

  // Validate moneyType if provided
  if (req.body.moneyType && !["minute", "hour", "project"].includes(req.body.moneyType)) {
    throw new ApiError("Invalid moneyType. Must be 'minute', 'hour', or 'project'", 400);
  }

  const fields = [
    "name",
    "phone",
    "designation",
    "experience",
    "money",
    "moneyType",
    "expertise",
    "certifications",
    "languages",
    "address",
    "location",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "languages") {
        consultant.languages = Array.isArray(req.body.languages)
          ? req.body.languages
          : req.body.languages.toString().split(",").map((l) => l.trim());
      } else if (typeof req.body[field] === "string") {
        consultant[field] = req.body[field].trim();
      } else {
        consultant[field] = req.body[field];
      }
    }
  });

  if (req.files?.image?.[0])
    consultant.image = `/uploads/${req.files.image[0].filename}`;
  if (req.files?.idProof?.[0])
    consultant.idProof = `/uploads/${req.files.idProof[0].filename}`;

  try {
    const updated = await consultant.save();
    
    // Return updated consultant with full URLs
    const updatedWithFullUrls = {
      ...updated.toObject(),
      image: updated.image ? `${baseUrl}${updated.image}` : null,
      idProof: updated.idProof ? `${baseUrl}${updated.idProof}` : null
    };

    res.status(200).json({
      success: true,
      message: MESSAGES.CONSULTANT.UPDATE_SUCCESS,
      data: updatedWithFullUrls,
    });
  } catch {
    throw new ApiError(MESSAGES.CONSULTANT.UPDATE_FAIL, 500);
  }
});

export const deleteConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid consultant ID", 400);
  }

  const consultant = await consultantModel.findById(id);
  if (!consultant) throw new ApiError(MESSAGES.CONSULTANT.NOT_FOUND, 404);

  if (!isMasterAdmin(req) && consultant.user?.toString() !== req.user.id) {
    throw new ApiError(MESSAGES.CONSULTANT.NOT_AUTHORIZED, 403);
  }

  await consultant.deleteOne();
  res.status(200).json({
    success: true,
    message: MESSAGES.CONSULTANT.DELETE_SUCCESS,
  });
});