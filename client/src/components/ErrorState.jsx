function ErrorState({ message = "Something went wrong." }) {
  return <p className="message error">{message}</p>;
}

export default ErrorState;
