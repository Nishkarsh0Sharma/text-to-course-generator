// this file’s responsibility is:
//     AI-based generation
//     prompt building
//     response parsing
//     maybe fallback logic

import Course from "../models/course.model.js";
import Module from "../models/module.model.js";
import Lesson from "../models/lesson.model.js";

import openai from "../config/openai.js";

// Course starts //

const buildFallbackCourseOutline = (topic) => {
    return {
        title: `Course on ${topic}`,
        description: `This course provides a structured learning path for ${topic}, starting from the basics and moving toward practical understanding.`,
        tags: [topic.toLowerCase(), "beginner-friendly", "structured-learning"],
        modules: [
            {
                title: `Introduction to ${topic}`,
                lessons: [
                    { title: `What is ${topic}?` },
                    { title: `Why ${topic} matters` },
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
                    { title: `Tools and resources for learning ${topic}` },
                    { title: `First practical steps in ${topic}` },
                ],
            },
        ],
    };
};

const buildCourseOutlinePrompt = (topic) => {
    return `You generate beginner-friendly course outlines. Return only valid JSON with no markdown, no code fences, and no extra explanation.

            Create a beginner-friendly course outline for the topic: "${topic}".

            Return JSON in exactly this shape:
            {
                "title": "string",
                "description": "string",
                "tags": ["string", "string", "string"],
                "modules": [
                    {
                        "title": "string",
                        "lessons": [
                            { "title": "string" }
                        ]
                    }
                ]
            }

            Rules:
            - 3 modules exactly
            - 3 lessons per module exactly
            - keep titles concise
            - make the course practical and beginner-friendly
            - tags should be short lowercase strings
            - return only JSON`;
};

const parseCourseOutlineJson = (rawText, providerName) => {
    if (!rawText) {
        throw new Error(`${providerName} did not return course outline text`);
    }

    const parsed = JSON.parse(rawText);

    if (
        !parsed.title ||
        !parsed.description ||
        !Array.isArray(parsed.tags) ||
        !Array.isArray(parsed.modules)
    ) {
        throw new Error(`${providerName} returned invalid course outline structure`);
    }

    return parsed;
};

const generateCourseOutlineWithGemini = async (topic) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: buildCourseOutlinePrompt(topic),
                            },
                        ],
                    },
                ],
            }),
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.error?.message || `Gemini request failed with status ${response.status}`
        );
    }

    const rawText = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        ?.join("")
        ?.trim();

    return parseCourseOutlineJson(rawText, "Gemini");
};

const generateCourseOutlineWithClaude = async (topic) => {
    if (!process.env.CLAUDE_API_KEY) {
        throw new Error("CLAUDE_API_KEY is missing");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-3-5-haiku-latest",
            max_tokens: 1200,
            messages: [
                {
                    role: "user",
                    content: buildCourseOutlinePrompt(topic),
                },
            ],
        }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.error?.message || `Claude request failed with status ${response.status}`
        );
    }

    const rawText = data?.content
        ?.map((part) => part.text || "")
        ?.join("")
        ?.trim();

    return parseCourseOutlineJson(rawText, "Claude");
};

const generateCourseOutlineWithAI = async (topic) => {

    const response = await openai.responses.create({

        model: "gpt-5-mini",
        input: [

        {
            role: "system",
            content: [
                {
                    type: "input_text",
                    text: "You generate beginner-friendly course outlines. Return only valid JSON with no markdown, no code fences, and no extra explanation.",
                },
            ],
        },

        {
            role: "user",
            content: [
            {
                type: "input_text",
                text: buildCourseOutlinePrompt(topic),

            },
            ],
        },
        ],
    });

    const rawText =
        response.output_text ||
        response.output
            ?.flatMap((item) => item.content || [])
            ?.map((part) => part.text || "")
            ?.join("")
            ?.trim();

    return parseCourseOutlineJson(rawText, "OpenAI");
};

// Course ends //

// Lesson starts  //

const buildFallbackLessonEnrichment = (lessonTitle, moduleTitle) => {
    const videoQuery = `${lessonTitle} tutorial for beginners`;

    return {
        objectives: [
            `Understand the core idea behind ${lessonTitle}`,
            `Identify practical importance of ${lessonTitle}`,
            `Build a beginner-friendly understanding of ${lessonTitle}`,
        ],
        videoQuery,
        content: [
            {
                type: "heading",
                text: lessonTitle,
            },
            {
                type: "paragraph",
                text: `${lessonTitle} is an important concept in ${moduleTitle}. This lesson introduces the idea in a simple and structured way so that a beginner can understand the fundamentals clearly.`,
            },
            {
                type: "paragraph",
                text: `By learning ${lessonTitle}, the student builds a stronger foundation for upcoming concepts and gains confidence in understanding the broader topic.`,
            },
            {
                type: "code",
                language: "javascript",
                text: `function explainLesson() {\n  console.log("Learning: ${lessonTitle}");\n}\n\nexplainLesson();`,
            },
            {
                type: "mcq",
                question: `What best describes ${lessonTitle}?`,
                options: [
                    `It is an important learning concept in this course`,
                    `It is a type of database`,
                    `It is only a UI design pattern`,
                ],
                answer: 0,
                explanation: `${lessonTitle} is being taught as an important concept within this lesson, not as a database or only a UI pattern.`,
            },
            {
                type: "video",
                query: videoQuery,
            },
        ],
    };
};

const buildLessonEnrichmentPrompt = (lessonTitle, moduleTitle) => {
    return `You generate beginner-friendly lesson content. Return only valid JSON with no markdown, no code fences, and no extra explanation.

    Lesson title: "${lessonTitle}"
    Module title: "${moduleTitle}"

    Return JSON in exactly this shape:
    {
        "objectives": ["string", "string", "string"],
        "videoQuery": "string",
        "content": [
            { "type": "heading", "text": "string" },
            { "type": "paragraph", "text": "string" },
            { "type": "paragraph", "text": "string" },
            { "type": "code", "language": "javascript", "text": "string" },
            {
            "type": "mcq",
            "question": "string",
            "options": ["string", "string", "string"],
            "answer": 0,
            "explanation": "string"
            },
            { "type": "video", "query": "string" }
        ]
    }

    Rules:
    - exactly 3 objectives
    - keep explanations beginner-friendly
    - include one short practical code block only if the lesson is technical; otherwise include a simple pseudocode-style example
    - MCQ answer must be a zero-based index of the correct option
    - videoQuery should be a YouTube search query for a beginner tutorial
    - return only JSON`;
};

const parseLessonEnrichmentJson = (rawText, providerName) => {
    if (!rawText) {
        throw new Error(`${providerName} did not return lesson enrichment text`);
    }

    const parsed = JSON.parse(rawText);

    if (
        !Array.isArray(parsed.objectives) ||
        typeof parsed.videoQuery !== "string" ||
        !Array.isArray(parsed.content)
    ) {
        throw new Error(`${providerName} returned invalid lesson enrichment structure`);
    }

    return parsed;
};

const generateLessonEnrichmentWithOpenAI = async (lessonTitle, moduleTitle) => {
    const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [
            {
                role: "system",
                content: [
                    {
                        type: "input_text",
                        text: "You generate structured beginner-friendly lesson content. Return only valid JSON.",
                    },
                ],
            },
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: buildLessonEnrichmentPrompt(lessonTitle, moduleTitle),
                    },
                ],
            },
        ],
    });

    const rawText =
        response.output_text ||
        response.output
            ?.flatMap((item) => item.content || [])
            ?.map((part) => part.text || "")
            ?.join("")
            ?.trim();

    return parseLessonEnrichmentJson(rawText, "OpenAI");
};

const generateLessonEnrichmentWithGemini = async (lessonTitle, moduleTitle) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: buildLessonEnrichmentPrompt(lessonTitle, moduleTitle),
                            },
                        ],
                    },
                ],
            }),
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.error?.message || `Gemini request failed with status ${response.status}`
        );
    }

    const rawText = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        ?.join("")
        ?.trim();

    return parseLessonEnrichmentJson(rawText, "Gemini");
};

const generateLessonEnrichmentWithClaude = async (lessonTitle, moduleTitle) => {
    if (!process.env.CLAUDE_API_KEY) {
        throw new Error("CLAUDE_API_KEY is missing");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-3-5-haiku-latest",
            max_tokens: 1800,
            messages: [
                {
                    role: "user",
                    content: buildLessonEnrichmentPrompt(lessonTitle, moduleTitle),
                },
            ],
        }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.error?.message || `Claude request failed with status ${response.status}`
        );
    }

    const rawText = data?.content
        ?.map((part) => part.text || "")
        ?.join("")
        ?.trim();

    return parseLessonEnrichmentJson(rawText, "Claude");
};

const generateLessonEnrichment = async (lessonTitle, moduleTitle) => {
    let providerUsed = "fallback";

    try {
        const enrichment = await generateLessonEnrichmentWithOpenAI(lessonTitle, moduleTitle);
        providerUsed = "openai";
        return { ...enrichment, providerUsed };
    } catch (openAiError) {
        console.error("OpenAI lesson enrichment failed:", openAiError.message);

        try {
            const enrichment = await generateLessonEnrichmentWithGemini(lessonTitle, moduleTitle);
            providerUsed = "gemini";
            return { ...enrichment, providerUsed };
        } catch (geminiError) {
            console.error("Gemini lesson enrichment failed:", geminiError.message);

            try {
                const enrichment = await generateLessonEnrichmentWithClaude(lessonTitle, moduleTitle);
                providerUsed = "claude";
                return { ...enrichment, providerUsed };
            } catch (claudeError) {
                console.error("Claude lesson enrichment failed, using fallback lesson content:", claudeError.message);
                return {
                    ...buildFallbackLessonEnrichment(lessonTitle, moduleTitle),
                    providerUsed,
                };
            }
        }
    }
};

// Lesson ends //

// this function takes a topic as input and generates a course structure with modules and lessons.
const generateCourseContent = async(topic,creator) => {
    let generatedCourse;
    let providerUsed = "fallback";

    // OpenAI
    //   ↓ if fails
    // Gemini
    //   ↓ if fails
    // Claude
    //   ↓ if fails
    // buildFallbackCourseOutline
    try {
        generatedCourse = await generateCourseOutlineWithAI(topic);
        providerUsed = "openai";
    } catch (openAiError) {
        console.error("OpenAI course outline generation failed:", openAiError.message);

        try {
            generatedCourse = await generateCourseOutlineWithGemini(topic);
            providerUsed = "gemini";
        } catch (geminiError) {
            console.error("Gemini course outline generation failed:", geminiError.message);

            try {
                generatedCourse = await generateCourseOutlineWithClaude(topic);
                providerUsed = "claude";
            } catch (claudeError) {
                console.error("Claude course outline generation failed, using fallback outline:", claudeError.message);
                generatedCourse = buildFallbackCourseOutline(topic);
                providerUsed = "fallback";
            }
        }
    }

    console.log(`Course outline generated using provider: ${providerUsed}`);

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

    // step 6: return a frontend-friendly nested respone shape
    return {
        _id: savedCourse._id,
        title: savedCourse.title,
        description: savedCourse.description,
        tags: savedCourse.tags,
        providerUsed,
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
const getAllCourses = async (creator) => {
    const courses = await Course.find({creator})
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
const getCourseById = async (courseId , creator) => {
    const course = await Course.findOne({ _id: courseId, creator }).populate({
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
const getLessonById = async (lessonId , creator) =>{

    // this will return the lesson with its module's title and course id (but not the full course details)
    const lesson = await Lesson.findById(lessonId).populate({
        path: "module",
        select: "title course createdAt updatedAt",
    });

    if(!lesson || !lesson.module) return null;

    // Now lesson access only works if the lesson belongs to a course owned by the logged-in user.
    const course = await Course.findOne({
        _id: lesson.module.course,
        creator,
    }).select("_id"); // only return _id field
    
    if( !course ) return null;

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
const generateLessonContentById = async(lessonId , creator) => {
    const lesson = await Lesson.findById(lessonId).populate({
        path: "module",
        select: "title course", 
    });

    if(!lesson || !lesson.module) return null;

    // Now lesson access only works if the lesson belongs to a course owned by the logged-in user.
    const course = await Course.findOne({ _id: lesson.module.course , creator }).select("_id"); // only return _id field
    if(!course) return null;

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

    const lessonEnrichment = await generateLessonEnrichment(
        lesson.title,
        lesson.module.title
    );

    console.log(`Lesson content generated using provider: ${lessonEnrichment.providerUsed}`);


    const updatedLesson = await Lesson.findByIdAndUpdate(
        lesson._id,
        {
            objectives: lessonEnrichment.objectives,
            content: lessonEnrichment.content,
            videoQuery: lessonEnrichment.videoQuery,
            isEnriched: true,
        },
        { new: true }
    ).populate({
        path: "module",
        select: "title course createdAt updatedAt",
    });

    if (!updatedLesson || !updatedLesson.module) return null;

    return {
        _id: updatedLesson._id,
        title: updatedLesson.title,
        objectives: updatedLesson.objectives,
        content: updatedLesson.content,
        videoQuery: updatedLesson.videoQuery,
        isEnriched: updatedLesson.isEnriched,
        createdAt: updatedLesson.createdAt,
        updatedAt: updatedLesson.updatedAt,

        module: updatedLesson.module
        ? {
            _id: updatedLesson.module._id,
            title: updatedLesson.module.title,
            course: updatedLesson.module.course,
            createdAt: updatedLesson.module.createdAt,
            updatedAt: updatedLesson.module.updatedAt,
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
