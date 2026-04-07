function MCQBlock( { question , options , answer , explanation } ){
    return (
        <div className="section-card" style={{marginTop:"1rem"}}>
            <h3>{question}</h3>

            <ul className="objective-list">
                {options.map((option,index)=>(
                    <li key={index} >{option}</li>
                ))}
            </ul>

            <p className="meta">
                Correct answer: {options[answer]}
            </p>

            <p>{explanation}</p>

        </div>
    ); 
}

export default MCQBlock;