import React from "react";

export default function Card({ title, value }) {
  return (
    <div className="bg-white shadow p-6 rounded-md flex flex-col items-center justify-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
