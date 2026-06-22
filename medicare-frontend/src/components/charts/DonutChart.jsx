import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({ title, data }) {
  const labels = Object.keys(data || { Lab: 5, Prescription: 4, Imaging: 3 });
  const values = Object.values(data || { Lab: 5, Prescription: 4, Imaging: 3 });

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"], // Tailwind colors: blue, yellow, green
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ allows height control via parent
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: title },
    },
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96 bg-white p-4 rounded-2xl shadow">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
