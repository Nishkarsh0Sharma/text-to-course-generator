import { useEffect , useState } from "react";
import { Link , useParams } from "react-router-dom";

import { getCourseById } from "../utils/api.js";

import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";

import { useAuth0 } from "@auth0/auth0-react";

// "useParams()" means we are using the useParams hook from react-router-dom to access the URL parameters in our Course component.

// gets courseId from URL
// fetches real course data from backend
// handles loading/error/not-found states
// renders modules and lesson links
function Course(){
    const { courseId } = useParams();

    const [course , setCourse] = useState(null);
    const [isLoading , setIsLoading] = useState(true);
    const [error , setError] = useState("");

    const { isAuthenticated , isLoading: authLoading , getAccessTokenSilently } = useAuth0();

    useEffect(()=>{
        // fetch the courseId course
        const fetchCourse = async()=>{

            if( !isAuthenticated ){
                setCourse(null);
                setIsLoading(false);
                return;
            }

            try {
                setError("");
                setIsLoading(true);

                const token = await getAccessTokenSilently();
                const result = await getCourseById(courseId, token);

                if(!result.success){
                    setError(result.message || "Failed to fetch course");
                    return;
                }

                setCourse(result.data);
            } catch (error) {
                setError( error.message || "Something went wrong while fetching the course");
            } finally {
                setIsLoading(false);
            }
        };

        if( !authLoading ){
            fetchCourse(); 
        }

    } , [courseId , isAuthenticated , authLoading , getAccessTokenSilently] );

    if( isLoading ){
        return (
            <main className="page">
                <LoadingState message="Loading course..." />
            </main>
        );
    }

    if( error ){
        return (
            <main className="page">
                <ErrorState message={error} />
            </main>
        );
    }

    if( !isAuthenticated && !authLoading ){
        return (
            <main className="page">
                <EmptyState message = "Log in to view this course." />
            </main>
        );
    }

    if( !course ){
        return (
            <main className="page">
                <EmptyState message="Course not found."/>
            </main>
        );
    }

    return(
        <main className="page">
            <Link className="back-link" to="/" >Back to Home</Link>

            <header className="page-header">
                <h1>{course.title}</h1>
                <p>{course.description}</p>
            </header>

            <section>

                <h2 className="section-title">Modules</h2>

                {course.modules.length === 0 && <EmptyState message="No modules found for this course." />}

                <div className="stack">
                    {course.modules.map((module)=>(
                        <article key={module._id} className="section-card module-card">
                            <h3>{module.title}</h3>

                            {module.lessons.length === 0 && <p className="meta">No lessons found in this module.</p>}
                            
                            <ul className="lesson-list">
                                {module.lessons.map((lesson)=>(
                                    <li key={lesson._id}>
                                        <Link to={`/lessons/${lesson._id}`}>{lesson.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

            </section>
        </main>
    );
}

export default Course;
