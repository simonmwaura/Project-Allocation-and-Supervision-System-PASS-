import { useNavigate, Link } from 'react-router-dom';

const BRAND = "#302AE2";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
        <img 
          src="https://www.uonbi.ac.ke/sites/default/files/UoN_Logo.png" 
          alt="UoN Logo" 
          className="h-12 md:h-14 w-auto object-contain" 
        />
        <span className="text-2xl font-black tracking-tight" style={{ color: BRAND }}>
          PASS
        </span>
      </Link>
      
      <div>
        <button 
          onClick={() => navigate('/login')}
          className="text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          style={{ backgroundColor: BRAND }}
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;