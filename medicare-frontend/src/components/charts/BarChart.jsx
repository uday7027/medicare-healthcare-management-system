import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ title, data }) {
  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
    datasets: [
      {
        label: title,
        data: data || [5, 8, 6, 7, 10, 3, 6],
        backgroundColor: "rgba(59, 130, 246, 0.7)", // Tailwind blue-500
        borderRadius: 6, // rounded corners on bars
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ allows height control via parent container
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: title },
    },
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96 bg-white p-4 rounded-2xl shadow">
      <Bar data={chartData} options={options} />
    </div>
  );
}
