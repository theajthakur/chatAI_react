import "../../assets/css/loader.css";
export default function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-inner">
        <div className="lds-ripple">
          <div></div>
          <div></div>
        </div>
        <div className="loading-text">
          <p>Please Wait</p>
        </div>
      </div>
    </div>
  );
}
