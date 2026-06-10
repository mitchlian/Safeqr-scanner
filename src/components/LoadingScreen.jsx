import { ClipLoader } from "react-spinners";

function LoadingScreen() {

  return (
    <div className="card loading">

      <ClipLoader size={80} />

      <h2>Analyzing URL...</h2>

      <p>Checking Google Safe Browsing API</p>
      <p>Checking blacklist database</p>
      <p>Checking URL structure</p>

    </div>
  );
}

export default LoadingScreen;