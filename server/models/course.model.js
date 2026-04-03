// import the mongoose library to define the schema and model for the Course collection in MongoDB
import mongoose from 'mongoose';

// define the schema for the Course collection
const courseSchema = new mongoose.Schema({
    // main title of the generated course
    title: {
        type: String,
        required: true,
        trim: true,
    },

    // short summary of what the course covers
    description: {
        type: String,
        default: "",
        trim: true,
    },

    // the auth0 user id or creator identifier
    creator:{
        type: String,
        required: true,
        trim: true,
    },

    // reference to all modules that belong to this course
    modules: [
        {
            type : mongoose.Schema.Types.ObjectId, // reference to the Module model
            ref: "Module", 
        },

    ],

    tags: [
        {
            type: String,
            trim: true,
        }
    ],

},

{
    timestamps: true, // automatically add createdAt and updatedAt fields
}

);

// create the Course model using the defined schema
const Course = mongoose.model('Course', courseSchema);

export default Course;