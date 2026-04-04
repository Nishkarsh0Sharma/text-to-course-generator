import { useParams } from "react-router-dom";

// "useParams()" means we are using the useParams hook from react-router-dom to access the URL parameters in our Course component.
function Course(){
    const { courseId } = useParams();

    return(
        <main>
            <h1>Course Page</h1>
            <p>Viewing Course: {courseId}</p>
        </main>
    );
}

export default Course;
