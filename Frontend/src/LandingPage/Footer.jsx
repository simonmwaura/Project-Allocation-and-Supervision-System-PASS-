const Footer = () => {
  return (
    <footer className="w-full max-w-6xl mx-auto mt-auto mb-8 border border-gray-100 rounded-2xl p-8 bg-white/80 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-4 gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="https://www.uonbi.ac.ke/sites/default/files/UoN_Logo.png" 
            alt="UoN" 
            className="h-10 w-auto" 
          />
          <span className="text-xl font-bold text-[#2b20d6]">PASS</span>
        </div>
        <div className="flex gap-8 text-sm font-semibold text-gray-500">
          <a href="#" className="hover:text-[#2b20d6] transition-colors">Help & FAQs</a>
          <a href="#" className="hover:text-[#2b20d6] transition-colors">Contact</a>
          <a href="#" className="hover:text-[#2b20d6] transition-colors">Department Website</a>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 font-bold tracking-wide uppercase">
        © 2026 PASS™ . University of Nairobi . All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;