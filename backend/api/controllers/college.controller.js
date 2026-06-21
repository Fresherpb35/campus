import { College } from "../model/college.schema.js";

//  create college
export const createCollege = async (req, res, next) => {
  try {
    const { collegeName, address } = req.body;
    if (!collegeName || !address) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    // case : 1 only one admin create one college
    const isAdminExist = await College.findOne({ admin: req.user.id });
    if (isAdminExist) {
      return res.status(400).json({
        message: "Admin can create only one college",
      });
    }
    //  case 2 : two admin can not create one (same) college
    const isCollegeExist = await College.findOne({ collegeName: collegeName });
    if (isCollegeExist) {
      return res.status(400).json({
        message: "College is already exist with this name",
      });
    }
    const college = await College.create({
      collegeName,
      address,
      admin: req.user.id,
    });
    return res.status(201).json({
      message: "college created successfully",
      college: college,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  get colleges:
export const getallColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({});

    if (!colleges || colleges.length === 0) {
      return res.status(400).json({
        message: "No college found",
      });
    }
    return res.status(200).json({
      data: colleges,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};