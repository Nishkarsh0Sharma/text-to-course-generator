// its own title
// which course it belongs to
// which lessons belong to it

import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    // Title of the module inside a course
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Reference to the parent course this module belongs to
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // References to all lessons inside this module
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;
