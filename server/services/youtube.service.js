// to send http request 
import axios from "axios";

// call YouTube api 
const searchYouTubeVideo = async(query)=> {
    if(!process.env.YOUTUBE_API_KEY){
        throw new Error("YOUTUBE_API_KEY is missing in environment variables");
    }

    const response = await axios.get("https://www.googleapis.com/youtube/v3/search",{
        params : {
            part : "snippet",
            q: query,
            key: process.env.YOUTUBE_API_KEY,
            maxResults: 1,
            type: "video",
            videoEmbeddable: "true",
        },
    });

    const items = response.data.items || [];

    if(items.length === 0) return null;

    const firstVideo = items[0];

    return{
        videoId : firstVideo.id.videoId,
        title : firstVideo.snippet.title,
    };

};

export { searchYouTubeVideo };