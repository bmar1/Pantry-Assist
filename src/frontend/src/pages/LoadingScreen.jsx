import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        navigate("/dashboard");
      }, 500); // fade-out duration
    }, 6500); // total loading time
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"
        }`}
      style={{ backgroundColor: "#22c55e" }}
    >
      <h1 className="text-white text-3xl font-bold mb-8">
        Loading... Making you a great meal plan!
      </h1>

      {/* Progress bar container */}
      <div className="w-64 h-3 bg-white/30 rounded-full overflow-hidden">
        {/* Progress bar animation */}
        <div
          className="h-3 bg-white rounded-full"
          style={{
            animation: "progressBar 5s linear forwards",
          }}
        ></div>
      </div>
      {/* On each frame adjust the progress bar's width */}
      <style jsx>{`
        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
