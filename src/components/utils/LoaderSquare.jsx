import "../../assets/css/loaderSquare.css";
export default function LoaderSquare() {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <div class="lds-grid">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
