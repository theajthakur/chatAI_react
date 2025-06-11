import { Link } from "react-router-dom";
import GoogleLogin from "./utils/GoogleLogin";
function Auth({ setIsLogin, setIsLoading }) {
  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow p-4 border-0"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <i className="bi bi-shield-lock-fill fs-1 text-primary"></i>
          <h3 className="mt-2">Welcome to SecureAuth</h3>
          <p className="text-muted">Login securely with Google to continue</p>
        </div>
        <div className="row justify-content-center">
          <div className="col-sm-6 my-2 text-center">
            <GoogleLogin setIsLogin={setIsLogin} setIsLoading={setIsLoading} />
          </div>
          <div className="col-sm-6 my-2 text-center">
            <Link to={"/"} className="btn btn-outline-primary w-100">
              <span className="bi bi-house"></span> Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
