import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Course from "./pages/Course.jsx";
import Lesson from "./pages/Lesson.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses/:courseId" element={<Course />} />
      <Route path="/lessons/:lessonId" element={<Lesson />} />
    </Routes>
  );
}

export default App;
