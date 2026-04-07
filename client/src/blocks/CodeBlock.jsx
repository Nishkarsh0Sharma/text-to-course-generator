//<pre> <code></code> </pre>  this is used 

function CodeBlock({ language, text }) {
  return (
    <div className="section-card" style={ { marginTop: "1rem" } }>
      <p className="meta">Code Example ( {language} )</p>
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  );

}

export default CodeBlock;
