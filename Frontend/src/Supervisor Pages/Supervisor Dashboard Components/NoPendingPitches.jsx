import { useState, useEffect } from "react";
import { FiInbox } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

const EmptyCard = ({ title, filled, total, description }) => (
  <div
    className="bg-white border-[1.5px] rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow h-full"
    style={{ borderColor: BRAND, color: BRAND }}
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-8">{title}</h3>
    <div className="mb-8">
      <FiInbox className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" strokeWidth={1.5} />
    </div>
    <p className="font-bold text-base md:text-lg mb-4">
      Capacity: {filled} / {total} Accepted
    </p>
    <p className="text-sm md:text-base font-medium leading-relaxed max-w-[320px]">
      {description}
    </p>
  </div>
);

const NoPendingPitches = () => {
  const [capacity, setCapacity] = useState({ year2: { filled: 0, total: 0 }, year4: { filled: 0, total: 0 } });

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:5000/api/supervisors/capacity", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCapacity(data.data);
        else toast.error("Could not load capacity.");
      } catch {
        toast.error("Network error.");
      }
    };
    fetchCapacity();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <EmptyCard
        title="4th Year Pitches"
        filled={capacity.year4.filled}
        total={capacity.year4.total}
        description="You have no pending pitch requests. 4th-year students have not yet submitted project proposals for your supervision."
      />
      <EmptyCard
        title="2nd Year Pitches"
        filled={capacity.year2.filled}
        total={capacity.year2.total}
        description="You have no pending pitch requests. 2nd-year students have not yet submitted project proposals for your supervision."
      />
    </div>
  );
};

export default NoPendingPitches;