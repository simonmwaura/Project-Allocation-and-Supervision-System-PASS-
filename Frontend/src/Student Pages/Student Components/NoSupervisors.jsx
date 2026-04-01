import { FiClipboard } from "react-icons/fi";

const NoSupervisors = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-14 lg:p-20 bg-white border-2 border-[#2b20d6] rounded-2xl lg:rounded-3xl w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto shadow-sm transition-all duration-300">
      
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2b20d6] mb-6 lg:mb-8 text-center tracking-wide">
        No Supervisors Available Yet
      </h2>

      {/* Clipboard Icon */}
      <div className="text-[#2b20d6] mb-6 lg:mb-8">
        {/* FIX: Removed the static 'size' prop and used Tailwind to scale it perfectly across 3 screen sizes */}
        <FiClipboard className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32" strokeWidth={1.5} />
      </div>

      {/* Subtext */}
      <p className="text-[#2b20d6] text-center text-base md:text-lg lg:text-xl font-semibold leading-relaxed px-4 md:px-10 lg:px-16">
        The System Administrator has not yet uploaded the
        supervisor list for this cohort. Please check back later or
        contact the admin for more information.
      </p>

    </div>
  );
};

export default NoSupervisors;