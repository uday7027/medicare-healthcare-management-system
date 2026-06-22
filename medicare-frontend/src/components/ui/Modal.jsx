import React from "react";
import { createPortal } from "react-dom";

export default function Modal({ children, onClose }) {
  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative">
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            &#10005;
          </button>

          {/* Modal children content */}
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
