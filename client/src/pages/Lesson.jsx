import { useParams } from "react-router-dom";

function Lesson() {
  const { lessonId } = useParams();

  return (
    <main>
      <h1>Lesson Page</h1>
      <p>Viewing lesson: {lessonId}</p>
    </main>
  );
}

export default Lesson;
