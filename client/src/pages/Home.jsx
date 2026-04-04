// <main> means that this is the main content of the page, and it will be rendered in the body of the HTML document.
function Home(){
    return(
        <main>
            <h1>Text-to-Course Generation</h1>
            <p>Generate and explore AI-powered courses from any topic</p>
        </main>
    );
}

// default means that when we import this file in another file, we will get the Home component by default. 
// This allows us to import the Home component in other files without having to use curly braces {} around it, and we can also give it any name we want during import. 
// For example, we can do import MyHome from "./pages/Home.jsx"; and MyHome will refer to the Home component defined in this file.
export default Home;