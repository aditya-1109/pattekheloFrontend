import {  RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./login";
import SignUp from "./Signup";
import Home from "./home";
import Play from "./play";
import Game from "./game";

function App() {

  const route= createBrowserRouter([
    {path: "/login", element: <Login />}, 
    {path: "/signUp", element: <SignUp />},
    {path: "/", element: <Home />},
    {path: "/playteen",  element: <Play />},
    {path: "/game/:roomNo", element: <Game />},
  ])

  return (
    <div className="App">
    <RouterProvider router= {route}>
    </RouterProvider>
    </div>
  );
}

export default App;
