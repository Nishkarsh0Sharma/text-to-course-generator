// A lesson should know:
    // its title
    // which module it belongs to
    // its learning objectives
    // its rich content blocks
    // optional video query
    // whether it has been AI-enriched yet

import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    // Title of the lesson
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Reference to the parent module this lesson belongs to
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
    //   required: true,
    },

    // Learning goals for the lesson
    objectives: [
      {
        type: String,
        trim: true,
      },
    ],

    // Flexible lesson blocks like heading, paragraph, code, MCQ, or video
    content: [
      {
        // Trade-off of Mixed
            // Pros:
                // flexible
                // fast for this project
                // works well with AI-generated structured JSON
            // Cons:
                // less strict validation at schema level
        type: mongoose.Schema.Types.Mixed, // allows for any type of content block (e.g., text, code, video embed, quiz)
      },
    ],

    // Search query for finding a relevant educational video
    videoQuery: {
      type: String,
      default: "",
      trim: true,
    },

    // Indicates whether the lesson has been enriched with detailed AI content
    isEnriched: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
