// this file’s responsibility is:
//     AI-based generation
//     prompt building
//     response parsing
//     maybe fallback logic

import Course from "../models/course.model.js";
import Module from "../models/module.model.js";
import Lesson from "../models/lesson.model.js";

// this function takes a topic as input and generates a course structure with modules and lessons.
const generateCourseContent = async(topic,creator) => {
    // step 1 : build a dummy course outline
    // later , this can be replace with a real AI-generated output

    const generatedCourse = {
        title: `Course on ${topic}`,
        description: `This course provides a structured learning path for ${topic}, starting from the basics and moving toward practical understanding.`,
        tags: [ topic.toLowerCase() , "beginner-friendly", "structured-learning" ],
        modules: [
            {
                title: `Introduction to ${topic}`,
                lessons: [
                    { title: `What is ${topic}?` },
                    { title: `Why ${topic} matters`  },
                    { title: `Common use cases of ${topic}` },
                ],
            },

            {
                title: `Core Concepts of ${topic}`,
                lessons: [
                    { title: `Key fundamentals of ${topic}` },
                    { title: `Important terminology in ${topic}` },
                    { title: `How ${topic} works in practice` },
                ],
            },

            {
                title: `Getting Started with ${topic}`,
                lessons: [
                    { title: `Beginner roadmap for ${topic}` },
                    { title: `Tools and resources for learning ${topic}`   },
                    { title: `First practical steps in ${topic}`  },
                ],
            },

        ],
    };

    // step 2 : create the parent course first so we get it _id.
    const savedCourse = await Course.create({
        title: generatedCourse.title,
        description: generatedCourse.description,
        creator: creator,
        tags: generatedCourse.tags,
        modules: [],
    });

    const savedModules = [];

    // step 3: create lessons first , then create the module with those lesson ids
    for( const moduleItem of generatedCourse.modules ){

        const savedLessons = [];

        for( const lessonItem of moduleItem.lessons ){
            const savedLesson = await Lesson.create({
                title: lessonItem.title,
                module: null,
                objectives: [],
                content: [],
                videoQuery: "",
                isEnriched: false,
            });
            savedLessons.push(savedLesson);
        }

        const savedModule = await Module.create({
            title: moduleItem.title,
            course: savedCourse._id,
            // extract the _id from each saved lesson to create the module
            lessons: savedLessons.map(lesson => lesson._id), 
        });

        // step 4: update each lesson so it know which module it belongs to
        for(const lesson of savedLessons){
            lesson.module = savedModule._id;
            await lesson.save();
        } 

        savedModules.push(savedModule);
    }

    // step 5: return the course with all saved module ids
    // savedCourse already has the _id from step 2, now we just need to update its modules array with the saved module ids
    savedCourse.modules = savedModules.map(module => module._id);
    await savedCourse.save();

    // step 6: return a frontend-friendly neste respone shape
    return {
        _id: savedCourse._id,
        title: savedCourse.title,
        description: savedCourse.description,
        tags: savedCourse.tags,
        // for each module, we return its _id and title, and for each lesson inside that module, we return its _id and title as well
        modules: savedModules.map((module, moduleIndex) => ({
            _id: module._id,
            title: module.title,
            // for each lesson in the module, we find the corresponding lesson in the generatedCourse.modules using the moduleIndex, 
            // and then we map over those lessons to extract their _id from the savedLessons and their title from the original generatedCourse
            lessons: generatedCourse.modules[moduleIndex].lessons.map((lesson, lessonIndex) => ({
                _id: savedModules[moduleIndex].lessons[lessonIndex],
                title: lesson.title,
            })),
        })),
    };

};

// gives lightweight course list
const getAllCourses = async () => {
    const courses = await Course.find()
    .sort({ createdAt: -1 })
    .select("title description tags modules createdAt updatedAt");

    return courses.map((course)=>({
        _id: course._id,
        title: course.title,
        description: course.description,
        tags: course.tags,
        modulesCount: course.modules.length,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
    }));
};

// gives full nested course with modules and lessons
// uses populate() to replace IDs with actual documents
const getCourseById = async (courseId) => {
    const course = await Course.findById(courseId).populate({
        path: "modules",
        populate: {
            path: "lessons",
            select: "title objectives content videoQuery isEnriched createdAt updatedAt",
        },
    });

    if(!course) return null;

    return{
        _id: course._id,
        title: course.title,
        description: course.description,
        tags: course.tags,
        creator: course.creator,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,

        modules: course.modules.map((module)=>({
            _id: module._id,
            title: module.title,
            createdAt: module.createdAt,
            updatedAt: module.updatedAt,

            lessons: module.lessons.map((lesson)=>({
                _id: lesson._id,
                title: lesson.title,
                objectives: lesson.objectives,
                content: lesson.content,
                videoQuery: lesson.videoQuery,
                isEnriched: lesson.isEnriched,
                createdAt: lesson.createdAt,
                updatedAt: lesson.updatedAt,
            })),

        })),
    };
};

// gives detailed lesson info with its module's title and course id (but not the full course details)
const getLessonById = async (lessonId) =>{

    // this will return the lesson with its module's title and course id (but not the full course details)
    const lesson = await Lesson.findById(lessonId).populate({
        path: "module",
        select: "title course createdAt updatedAt",
    });

    if(!lesson) return null;

    return {
        _id: lesson._id,
        title: lesson.title,
        objectives: lesson.objectives,
        content: lesson.content,
        videoQuery: lesson.videoQuery,
        isEnriched: lesson.isEnriched,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,

        module: lesson.module
        ? {
            _id: lesson.module._id,
            title: lesson.module.title,
            course: lesson.module.course,
            createdAt: lesson.module.createdAt,
            updatedAt: lesson.module.updatedAt,
            }
        : null,

    };
};


// this function takes a lessonId as input and generates detailed content for that lesson, 
// including learning objectives, structured content blocks, and a video query. 
// It first checks if the lesson exists and if it has already been enriched. 
// If not, it builds dummy enrichment content (which can later be replaced with real AI-generated content), updates the lesson in the database, and returns the enriched lesson details.
const generateLessonContentById = async(lessonId) => {
    const lesson = await Lesson.findById(lessonId).populate({
        path: "module",
        select: "title course", 
    });

    if(!lesson) return null;

    // if lesson is already isEnriched , return the current saved lesson
    if( lesson.isEnriched ){
        return {
            _id: lesson._id,
            title: lesson.title,
            objectives: lesson.objectives,
            content: lesson.content,
            videoQuery: lesson.videoQuery,
            isEnriched: lesson.isEnriched,
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt,

            module: lesson.module
            ? {
                _id: lesson.module._id,
                title: lesson.module.title,
                course: lesson.module.course,
                createdAt: lesson.module.createdAt,
                updatedAt: lesson.module.updatedAt,
                }
            : null,

        };
    }

    // build dunmmy lesson emrichment content for now
    // later this can be replaced by real AI-generated content
    const generatedObjectives = [
        `Understand the core idea behind ${lesson.title}`,
        `Identify practical importance of ${lesson.title}`,
        `Build a begineer-friendly understanding of ${lesson.title}`,
    ];

    const generatedVideoQuery = `${lesson.title} tutorial for beginners`;

    const generatedContent = [
        {
            type: "heading",
            text: lesson.title,
        },
        {
            type: "paragraph",
            text: `${lesson.title} is an important concept in this course. This lesson introduces the idea in a simple and structured way so that a beginner can understand the fundamentals clearly.`,
        },
        {
            type: "paragraph",
            text: `By learning ${lesson.title}, the student builds a stronger foundation for the upcoming concepts in this module and gains confidence in understanding the broader topic.`,
        },
        {
            type: "code",
            language: "javascript",
            text: `function explainLesson() {\n  console.log("Learning: ${lesson.title}");\n}\n\nexplainLesson();`,
        },
        {
            type: "mcq",
            question: `What best describes ${lesson.title}?`,
            options: [
                `It is an important learning concept in this course`,
                `It is a type of database`,
                `It is only a UI design pattern`,
            ],
            answer: 0,
            explanation: `${lesson.title} is being taught as an important concept within this lesson, not as a database or only a UI pattern.`,
        },
        {
            type: "video",
            query: generatedVideoQuery,
        },
    ];


    lesson.objectives = generatedObjectives;
    lesson.content = generatedContent;
    lesson.videoQuery = generatedVideoQuery;
    lesson.isEnriched = true;

    await lesson.save();

    return {
        _id: lesson._id,
        title: lesson.title,
        objectives: lesson.objectives,
        content: lesson.content,
        videoQuery: lesson.videoQuery,
        isEnriched: lesson.isEnriched,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,

        module: lesson.module
        ? {
            _id: lesson.module._id,
            title: lesson.module.title,
            course: lesson.module.course,
            createdAt: lesson.module.createdAt,
            updatedAt: lesson.module.updatedAt,
            }
        : null,
    };
    
};

export { 
    generateCourseContent , 
    getAllCourses , 
    getCourseById ,
    getLessonById,
    generateLessonContentById ,
};