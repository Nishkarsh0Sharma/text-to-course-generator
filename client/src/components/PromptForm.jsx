// owns the input state locally
// calls onGenerate(topic) passed from parent
// clears input after successful submit flow


import { useState } from "react";

function PromptForm({ onGenerate , isLoading }) {
    const [topic,setTopic] = useState("");

    const handleSubmit = async(event) => {
        event.preventDefault(); // prevent the default form submission behavior which will cause a page reload

        if(!topic.trim()){
            return;
        }

        await onGenerate(topic.trim());
        setTopic("");
    };

    return (
        <section className="form-card">
            <form onSubmit={handleSubmit} className="form-row">
                <input 
                    className="input"
                    type="text"
                    placeholder="Enter a topic like Machine Learning"
                    value={topic}
                    onChange={(event)=> setTopic(event.target.value)}
                />

                <button className="button" type="submit" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Course"}
                </button>

            </form>
        </section>
    );

}

export default PromptForm;