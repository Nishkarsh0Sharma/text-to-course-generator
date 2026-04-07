import { useEffect , useState } from "react";
import { Link , useParams } from "react-router-dom";
import { getLessonById, generateLessonContent } from "../utils/api.js";

import LessonRenderer from "../components/LessonRenderer.jsx";

import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";

// fetches lesson by id
// generates lesson content if it is not enriched
// displays title, module, objectives, and content
// handles loading/error/not-found states
function Lesson() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setError("");
        setIsLoading(true);

        const lessonResult = await getLessonById(lessonId);

        if (!lessonResult.success) {
          setError(lessonResult.message || "Failed to fetch lesson");
          return;
        }

        let lessonData = lessonResult.data;

        if (!lessonData.isEnriched) {
          const generatedResult = await generateLessonContent(lessonId);

          if (!generatedResult.success) {
            setError(generatedResult.message || "Failed to generate lesson content");
            return;
          }

          lessonData = generatedResult.data;
        }

        setLesson(lessonData);
      } catch (err) {
        setError("Something went wrong while loading the lesson");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

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
            <Link className="black-line" to={`/courses/${lesson.module.course}`} >
                Back to Course
            </Link>
        )}

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
        
      
    </main>
  );
}

export default Lesson;
