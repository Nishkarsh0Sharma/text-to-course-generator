import { useEffect , useState , useRef } from "react";
import { Link , useParams } from "react-router-dom";
import { getLessonById, generateLessonContent } from "../utils/api.js";

import LessonRenderer from "../components/LessonRenderer.jsx";

import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { useAuth0 } from "@auth0/auth0-react";

// fetches lesson by id
// generates lesson content if it is not enriched
// displays title, module, objectives, and content
// handles loading/error/not-found states
function Lesson() {
    const { lessonId } = useParams();

    const [lesson, setLesson] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const lessonRef = useRef(null);

    const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();

    // this is called by "Download PDF" button on UI
    const handleDownloadPdf = async()=> {
        if(!lessonRef.current) return;

        // convert html to image(canva)
        const canvas = await html2canvas(lessonRef.current, {
            scale: 2,
            useCORS: true,
        });

        // convert to image (base64 string) 
        const imageData = canvas.toDataURL("image/png");
        
        // new pdf object(create new pdf) 
        const pdf = new jsPDF("p" , "mm" , "a4");

        // pdf size calculation
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = ( canvas.height * pdfWidth ) / canvas.width;

        // add image to pdf
        pdf.addImage( imageData , "PNG" , 0 , 0 , pdfWidth , pdfHeight );
        // download the pdf
        pdf.save(`${lesson.title}.pdf`);
    };

    useEffect(() => {
        const fetchLesson = async () => {

            if( !isAuthenticated ){
                setLesson(null);
                setIsLoading(false);
                return;
            }

            try {
                setError("");
                setIsLoading(true);
                
                const token = await getAccessTokenSilently();
                const lessonResult = await getLessonById(lessonId , token);

                if (!lessonResult.success) {
                    setError(lessonResult.message || "Failed to fetch lesson");
                    return;
                }

                let lessonData = lessonResult.data;

                if (!lessonData.isEnriched) {
                    const generatedResult = await generateLessonContent(lessonId , token);

                    if (!generatedResult.success) {
                    setError(generatedResult.message || "Failed to generate lesson content");
                    return;
                    }

                    lessonData = generatedResult.data;
                }

                setLesson(lessonData);
            } catch (err) {
            setError( err.message ||  "Something went wrong while loading the lesson");
            } finally {
            setIsLoading(false);
            }
        };

        if( !authLoading ) fetchLesson();
    }, [lessonId, isAuthenticated, authLoading, getAccessTokenSilently]);

    if(isLoading){
        return (
            <main className="page">
            <LoadingState message="Loading lesson..." />
            </main>
        );
    }

    if(error){
        return (
            <main className="page">
            <ErrorState message={error} />
            </main>
        );
    }

    if( !isAuthenticated && !authLoading ){
        return (
            <main className="page">
                <EmptyState message = "Log in to view this lesson." />
            </main>
        );
    }

    if(!lesson){
        return (
            <main className="page">
            <EmptyState message="Lesson not found." />
            </main>
        );
    }

    return (
    <main className="page">

        {lesson.module && (
            <Link className="back-link" to={`/courses/${lesson.module.course}`} style={{marginRight:"1rem"}} >
                Back to Course
            </Link>
        )}

        <button className="button" onClick={handleDownloadPdf} type="button" >
            Download PDF
        </button>

        <div ref={lessonRef}>

            <header className="page-header">
                <h1>{lesson.title}</h1>
                {lesson.module && <p>Module: {lesson.module.title}</p>}
            </header>

            <section className="section-card">
                <h2 className="section-title">Objectives</h2>

                {lesson.objectives.length === 0 ? (
                    <EmptyState message="No objectives available." />
                ) : (
                    <ul className="objective-list">
                        {lesson.objectives.map((objective,index)=>(
                            <li key={index}>{objective}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="section-card" style={{marginTop:"1rem"}}>
                <h2 className="section-title">Lesson Content</h2>
                <LessonRenderer content={lesson.content} />
            </section>

        </div>
        
        
    </main>
    );
}

export default Lesson;
