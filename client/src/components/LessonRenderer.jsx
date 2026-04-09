// handling block routing , block component render specific content types

import HeadingBlock from "../blocks/HeadingBlock.jsx";
import ParagraphBlock from "../blocks/ParagraphBlock.jsx"
import VideoBlock from "../blocks/VideoBlock.jsx"

import CodeBlock from "../blocks/CodeBlock.jsx";
import MCQBlock from "../blocks/MCQBlock.jsx";

// i/p : content array
// o/p : render correct React component for each block type
// This becomes the central renderer for lesson blocks, so Lesson.jsx no longer needs block-specific logic.
function LessonRenderer( {content} ){
    if(!content || content.length === 0){
        return <p>No lesson content available.</p>
    }

    return(
        <section>
            { content.map((block,index)=>{

                if( block.type === "heading" ){
                    return <HeadingBlock key={index} text={block.text} />;
                }

                if( block.type === "paragraph" ){
                    return <ParagraphBlock key={index} text={block.text} />;
                }

                if( block.type === "video" ){
                    return <VideoBlock key={index} query={block.query} />;
                }

                if( block.type === "code" ){
                    return <CodeBlock key={index} language={block.language} text={block.text} />
                }

                if( block.type === "mcq" ){
                    return <MCQBlock key={index} question={block.question} options={block.options} answer={block.answer} explanation={block.explanation} />
                }

                return (
                    <p key={index}>
                        Unsupported block type : {block.type}
                    </p>
                );


            }) }
        </section>
    );
}

export default LessonRenderer;
