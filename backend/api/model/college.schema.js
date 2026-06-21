import mongoose from "mongoose";

//  admin related
const collegeSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
  },
});

export const College = mongoose.model("College", collegeSchema);