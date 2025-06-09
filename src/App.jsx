import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "animate.css";

import { useState } from "react";
import "./App.css";
import GoogleLogin from "./components/utils/GoogleLogin";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <GoogleLogin />
    </>
  );
}

export default App;
