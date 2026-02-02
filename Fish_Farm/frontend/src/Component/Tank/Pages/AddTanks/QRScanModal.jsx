// import React, { useEffect, useRef } from "react";
// import { Html5Qrcode } from "html5-qrcode";

// const QRScanModal = ({ open, onClose, onResult }) => {
//   const containerRef = useRef(null);
//   const scannerRef = useRef(null);

//   useEffect(() => {
//     if (!open) return;

//     const start = async () => {
//       try {
//         if (!scannerRef.current) {
//           scannerRef.current = new Html5Qrcode("qr-reader");
//         }
//         await scannerRef.current.start(
//           { facingMode: "environment" },
//           {
//             fps: 10,
//             qrbox: (viewfinderWidth, viewfinderHeight) => {
//               const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
//               const boxSize = Math.floor(minEdge * 0.7);
//               return { width: boxSize, height: boxSize };
//             },
//           },
//           (decodedText) => {
//             // success
//             onResult(decodedText);
//             onClose();
//           },
//           () => {}
//         );
//       } catch (err) {
//         console.error("QR start failed:", err);
//         alert("Camera access failed. Please allow camera permissions.");
//       }
//     };

//     start();

//     return () => {
//       if (scannerRef.current?.isScanning) {
//         scannerRef.current.stop().then(() => {
//           scannerRef.current?.clear();
//         });
//       }
//     };
//   }, [open, onResult, onClose]);

//   if (!open) return null;

//   return (
//     <div className="qr-modal-backdrop" onClick={onClose}>
//       <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="qr-modal-header">
//           <h3>Scan QR</h3>
//           <button className="qr-close" onClick={onClose}>×</button>
//         </div>
//         <div id="qr-reader" ref={containerRef} className="qr-reader" />
//         <p className="qr-hint">Align the QR within the square.</p>
//       </div>
//     </div>
//   );
// };

// export default QRScanModal;
