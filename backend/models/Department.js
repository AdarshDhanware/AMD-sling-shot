const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    avgResolutionTime: {
      type: Number, // in hours
      default: 48,
    },
    headName: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
