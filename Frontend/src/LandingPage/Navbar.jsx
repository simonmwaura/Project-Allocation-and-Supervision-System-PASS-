const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-4">
        <img 
          src="https://www.uonbi.ac.ke/sites/default/files/UoN_Logo.png" 
          alt="UoN Logo" 
          className="h-14 w-auto object-contain" 
        />
        <span className="text-2xl font-bold text-[#2b20d6] tracking-tight">PASS</span>
      </div>
      <div>
        <button className="bg-[#2b20d6] text-white px-10 py-2.5 rounded-md font-bold hover:bg-blue-800 transition-all shadow-md">
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;