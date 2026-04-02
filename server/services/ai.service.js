// this file’s responsibility is:
//     AI-based generation
//     prompt building
//     response parsing
//     maybe fallback logic

const generateCourseContent = async ( topic ) => {
    // return a dummy course structure for now
    // later , this function will call an AI provider

    return {
        title : `Course on ${topic}`,
        description : `This course provides a structured learning path for ${topic}, starting from the basics and moving toward practical understanding.`,
        tags : [ topic.toLowerCase(), "beginner-friendly", "structured-learning" ],
        modules: [
            {
                title: `Introduction to ${topic}`,
                lessons: [
                `What is ${topic}?`,
                `Why ${topic} matters`,
                `Common use cases of ${topic}`,
                ],
            },
            {
                title: `Core Concepts of ${topic}`,
                lessons: [
                `Key fundamentals of ${topic}`,
                `Important terminology in ${topic}`,
                `How ${topic} works in practice`,
                ],
            },
            {
                title: `Getting Started with ${topic}`,
                lessons: [
                `Beginner roadmap for ${topic}`,
                `Tools and resources for learning ${topic}`,
                `First practical steps in ${topic}`,
                ],
            },
        ],
    };
};

export { generateCourseContent };

// Later lesson generation API will create:
    // objectives
    // paragraphs
    // code blocks
    // MCQs
    // video query
    // resources