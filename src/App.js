import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./Components/PrivateRoute";
import AuthorizationPage from "./Pages/AuthorizationPage";
import ErrorPage from "./Pages/ErrorPage";
import MainLayoutPage from "./Pages/MainLayoutPage";


function App() {
  return (
    <div className="App">
      <div className="App-loyaut">
      <Router>
        <Routes>
          <Route path="/" Component={AuthorizationPage} />
          <Route Component={PrivateRoute}>
            <Route path="/test" Component={MainLayoutPage} />
          </Route>
          <Route path="*" Component={ErrorPage} />
        </Routes>
      </Router>
      </div>
      <footer className="App-fouter"></footer>
    </div>
  );
}

export default App;
