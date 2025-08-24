import { Users, Video } from "lucide-react";

export const StatCard = ({ icon, title, value }) => (
  <div className="bg-gradient-to-r from-black via-black to-[#7c349c] shadow-lg rounded-lg p-6 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl hover:from-black hover:via-black hover:to-[#7c349c]">
    <div className="flex items-center space-x-4">
      <div className="bg-purple-600 text-white p-3 rounded-full">
        {icon}
      </div>
      <div className="text-white">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);
