import { useEffect , useState } from "react";
import { API_BASE_URL } from "../utils/api";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";

// call backend(GET) with query
// get videoId
// rendered it in frontend
function VideoBlock({ query }) {
    const [video,setVideo] = useState(null);
    const [isLoading,setIsLoading] = useState(true);
    const [error,setError] = useState("");

    useEffect(()=>{

        const fetchVideo = async() => {
            try {
                setIsLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE_URL}/lessons/video-search/query?query=${encodeURIComponent(query)}`
                );

                const result = await response.json();

                if(!result.success){
                    setError(result.message||"Failed to load video");
                    return;
                }

                setVideo(result.data);

            } catch (error) {
                setError("Something went wrong while loading the video");
                return;
            } finally{
                setIsLoading(false);
            }
        };

        if(query){
            fetchVideo();
        }

    }, [query] );

    if(isLoading){
        return <LoadingState/>;
    }

    if(error){
        return <ErrorState message={error}/>;
    }

    if(!video){
        return <p className="meta">No video available.</p>;
    }

    return(
        <div className="section-card" style={{marginTop : "1rem"}}>
            <h3>Recommended Video</h3>
            <p className="meta">{video.title}</p>
            <iframe width="100%" height="315" src={`https://www.youtube-nocookie.com/embed/${video.videoId}`} title={video.title} frameBorder="0" allowFullScreen />
        </div>
    );
}

export default VideoBlock;
