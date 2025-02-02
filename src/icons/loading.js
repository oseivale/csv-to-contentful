// export const Loading = () => (
  // <svg
  //   xmlns="http://www.w3.org/2000/svg"
  //   width="24"
  //   height="24"
  //   viewBox="0 0 24 24"
  // >
  //   <g
  //     fill="none"
  //     stroke="#fff"
  //     stroke-linecap="round"
  //     stroke-linejoin="round"
  //     stroke-width="2"
  //   >
  //     <path
  //       stroke-dasharray="16"
  //       stroke-dashoffset="16"
  //       d="M12 3c4.97 0 9 4.03 9 9"
  //     >
  //       <animate
  //         fill="freeze"
  //         attributeName="stroke-dashoffset"
  //         dur="0.3s"
  //         values="16;0"
  //       />
  //       <animateTransform
  //         attributeName="transform"
  //         dur="1.5s"
  //         repeatCount="indefinite"
  //         type="rotate"
  //         values="0 12 12;360 12 12"
  //       />
  //     </path>
  //     <path
  //       stroke-dasharray="64"
  //       stroke-dashoffset="64"
  //       stroke-opacity="0.3"
  //       d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
  //     >
  //       <animate
  //         fill="freeze"
  //         attributeName="stroke-dashoffset"
  //         dur="1.2s"
  //         values="64;0"
  //       />
  //     </path>
  //   </g>
  // </svg>
  // <svg
  //   xmlns="http://www.w3.org/2000/svg"
  //   width="48"
  //   height="48"
  //   viewBox="0 0 24 24"
  // >
  //   <path
  //     fill="#3834c1"
  //     d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
  //     opacity="0.5"
  //   />
  //   <path fill="#3834c1" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z">
  //     <animateTransform
  //       attributeName="transform"
  //       dur="1s"
  //       from="0 12 12"
  //       repeatCount="indefinite"
  //       to="360 12 12"
  //       type="rotate"
  //     />
  //   </path>
  // </svg>
// );


export const Loading = ({ progress }) => {
  const circleRadius = 40; // Radius of the progress circle
  const strokeWidth = 6; // Thickness of the stroke
  const circumference = 2 * Math.PI * circleRadius; // Circumference of the circle
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: "relative", width: "100px", height: "100px", transition: "height 0.4s ease-in-out", }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={circleRadius}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r={circleRadius}
          stroke="#4caf50"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s ease-in-out",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      {/* Percentage Text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "16px",
          fontWeight: "bold",
          textAlign: 'center',
          transition: "height 0.4s ease-in-out",
        }}
      >
        {progress}% 
        <sub style={{ fontSize: '.5rem', display: 'block'}}>Completed</sub>
      </div>
    </div>
  );
};

export const Completed = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100"
    height="100"
    viewBox="0 0 24 24"
  >
    <g
      fill="none"
      //   stroke="#5cbb1f"
      stroke="#4caf50"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path
        strokeDasharray="64"
        strokeDashoffset="64"
        d="M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.6s"
          values="64;0"
        />
      </path>
      <path strokeDasharray="14" strokeDashoffset="14" d="M8 12l3 3l5 -5">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.6s"
          dur="0.2s"
          values="14;0"
        />
      </path>
    </g>
  </svg>
)