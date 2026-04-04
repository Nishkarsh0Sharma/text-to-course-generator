// it should centralized the frontend API calls to backend server

// a clean single place for all current backend calls.

const API_BASE_URL = "http://localhost:5001/api";

const getAllCourses = async()=>{
    const response = await fetch(`${API_BASE_URL}/courses`);
    return response.json();
};

const getCourseById = async(courseId)=> {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    return response.json();
};

const generateCourse = async(topic) => {
    // "Content-Type": "application/json" means that we are sending JSON data in the request body, and the server should parse it as JSON.
    const response = await fetch(`${API_BASE_URL}/courses/generate-course`, {
        method : "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({topic}),
    });

    return response.json();
};

const getLessonById = async(lessonId) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`);
    return response.json();
};

const generateLessonContent = async(lessonId) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/generate`, {
        method: "POST",
    });

    return response.json();
}

export {
    API_BASE_URL,
    getAllCourses,
    getCourseById,
    generateCourse,
    getLessonById,
    generateLessonContent,
};
