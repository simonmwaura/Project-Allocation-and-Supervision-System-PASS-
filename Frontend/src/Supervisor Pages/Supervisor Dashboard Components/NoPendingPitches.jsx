import React from "react";
import { FiInbox } from "react-icons/fi";

const BRAND = "#2b20d6";

const EmptyCard = ({ title, capacity, description }) => {
  return (
    <div
      className="bg-white border-[1.5px] rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow h-full"
      style={{ borderColor: BRAND, color: BRAND }}
    >
      <h3 className="text-2xl md:text-3xl font-bold mb-8">{title}</h3>
      
      <div className="mb-8">
        <FiInbox className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" strokeWidth={1.5} />
      </div>
      
      <p className="font-bold text-base md:text-lg mb-4">Capacity: {capacity}</p>
      
      <p className="text-sm md:text-base font-medium leading-relaxed max-w-[320px]">
        {description}
      </p>
    </div>
  );
};

const NoPendingPitches = () => {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <EmptyCard 
        title="4th Year Pitches"
        capacity="0 / 6 Accepted"
        description="You have no pending pitch requests. 4th-year students have not yet submitted project proposals for your supervision."
      />

      <EmptyCard 
        title="2nd Year Pitches"
        capacity="0 / 6 Accepted"
        description="You have no pending pitch requests. 2nd-year students have not yet submitted project proposals for your supervision."
      />
    </div>
  );
};

export default NoPendingPitches;