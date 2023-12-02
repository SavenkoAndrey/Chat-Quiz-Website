import React from "react";

function ErrorPage() {
  return (
    <div className="container-error-page">
      <div className="error-page">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred</p>
        <p><i>Page Not Found</i></p>
        <a href="/test"> Back to HomePage </a>
      </div>
    </div>
  );
}

export default ErrorPage;
