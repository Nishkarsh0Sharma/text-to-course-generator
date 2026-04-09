import { useEffect , useState } from "react";
import { Link } from "react-router-dom";
import { getAllCourses , generateCourse } from "../utils/api.js";
import PromptForm from "../components/PromptForm.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth0 } from "@auth0/auth0-react";

// <main> means that this is the main content of the page, and it will be rendered in the body of the HTML document.

// Mount → useEffect → fetchCourse → setCourses → render
// User input → setTopic → render
// Submit → generateCourse → fetchCourse → setCourses → render
function Home(){
    const [topic,setTopic] = useState("");
    const [courses , setCourses] = useState([]);
    const [isLoading , setIsLoading] = useState(false);
    const [error , setError] = useState("");

    // Auth0 React hook is destructuring here
    const { loginWithRedirect, logout, isAuthenticated, user, isLoading: authLoading , getAccessTokenSilently  } = useAuth0();


    // this function will fetch all the courses from the backend server and update the state with the fetched courses.
    const fetchCourse = async () => {
        try {
            setError(""); // clear any previous error messages before making the API call

            const result = await getAllCourses();

            if(!result.success){
                setError(result.message || "Failed to fetch courses");
                return;
            }

            setCourses(result.data);

        } catch (error) {
            setError("Something went wrong while fetching courses");
        }
    };

    // run for the first time when the component mounts, 
    // and it will fetch all the courses from the backend server and update the state with the fetched courses.
    useEffect(()=>{
        fetchCourse();
    } , [] );

    // this function will handle the form submission for generating a new course based on the input topic, and it will call the generateCourse API function to send a request to the backend server to generate a new course, and then it will refresh the course list by calling fetchCourse after successfully generating a new course.
    const handleGenerateCourse = async(topic) => {

        if(!isAuthenticated){
            setError("Please log in to generate a course");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const token = await getAccessTokenSilently();
            const result = await generateCourse(topic.trim(), token);

            if(!result.success){
                setError(result.message || "Failed to generate course");
                return;
            }

            await fetchCourse(); // refresh the course list after generating a new course
        } catch (error) {
            console.error("Generate course error:" , error);
            setError(error.message || "Something went wrong while generating the course");
        }finally{ // finally block will run regardless of whether the try block succeeds or the catch block catches an error, so it's a good place to put cleanup code like setting isLoading to false after the API call is done.
            setIsLoading(false);
        }
    };
// if (authLoading)
//   → show loading
// else if (isAuthenticated)
//   → show user + logout
// else
//   → show login button
    return(
        <main className="page">

            <header className="page-header">

                <h1>Text-to-Course Generator</h1>
                <p>Generate and explore AI-powered courses from any topic.</p>

                <div style={{marginTop:"1rem"}}>

                    { authLoading ? (
                        <p className="meta">Checking login status...</p>
                    ) : isAuthenticated ? (
                        <>
                            <p className="meta">Logged in as : {user?.name || user?.email}</p>
                            <button 
                                className="button" 
                                type="button" 
                                onClick={()=> logout({logoutParams : {returnTo : window.location.origin}})}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button className="button" type="button" onClick={ async()=>{
                                try{
                                    await loginWithRedirect();
                                }catch(error){
                                    setError(error.message || "Login failed");
                                } 
                            }} >
                            Login
                        </button>
                    )}

                </div>

            </header>

            <PromptForm onGenerate={handleGenerateCourse} isLoading={isLoading} />

            {error && <ErrorState message={error} />}

            <section>

                <h2 className="section-title">Saved Courses</h2>
                {isLoading && <LoadingState message="Loading courses..." />}
                { !isLoading && courses.length === 0 && <EmptyState message="No courses found yet." /> }

                <div className="stack">
                    { !isLoading &&
                        courses.map((course)=>(
                            <article key={course._id} className="card"> 
                                <h3>
                                    <Link to={`/courses/${course._id}`} >{course.title}</Link>
                                </h3>
                                <p>{course.description}</p>
                                <p className="meta">Modules : {course.modulesCount}</p>
                                <Link to={`/courses/${course._id}`} >Open Course</Link>
                            </article>
                        ))
                    }
                </div>

            </section>

        </main>
    );
}

// default means that when we import this file in another file, we will get the Home component by default. 
// This allows us to import the Home component in other files without having to use curly braces {} around it, and we can also give it any name we want during import. 
// For example, we can do import MyHome from "./pages/Home.jsx"; and MyHome will refer to the Home component defined in this file.
export default Home;
