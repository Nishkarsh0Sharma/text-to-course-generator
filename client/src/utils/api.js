// it should centralized the frontend API calls to backend server

// a clean single place for all current backend calls.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const parseJsonResponse = async (response) => {
    const result = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(result?.message || `Request failed with status ${response.status}`);
    }

    return result;
};

const getAllCourses = async()=>{
    const response = await fetch(`${API_BASE_URL}/courses`);
    return parseJsonResponse(response);
};

const getCourseById = async(courseId)=> {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    return parseJsonResponse(response);
};

const generateCourse = async(topic,token) => {
    // "Content-Type": "application/json" means that we are sending JSON data in the request body, and the server should parse it as JSON.
    const response = await fetch(`${API_BASE_URL}/courses/generate-course`, {
        method : "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({topic}),
    });

    return parseJsonResponse(response);
};

const getLessonById = async(lessonId) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`);
    return parseJsonResponse(response);
};

const generateLessonContent = async(lessonId) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/generate`, {
        method: "POST",
    });

    return parseJsonResponse(response);
}

export {
    API_BASE_URL,
    getAllCourses,
    getCourseById,
    generateCourse,
    getLessonById,
    generateLessonContent,
};
