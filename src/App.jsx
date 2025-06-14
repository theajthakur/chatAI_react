import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainRoutes from "./MainRoutes";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
