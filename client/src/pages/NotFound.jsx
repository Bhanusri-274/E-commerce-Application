import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6 font-display text-[120px] font-extrabold leading-none text-[#E2E8F0] sm:text-[180px]">
        404
        <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-[#2563EB] sm:text-5xl">
          Oops!
        </span>
      </div>
      <h1 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-[#64748B]">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16}/> Go Back
        </button>
        <Link to="/" className="btn-primary flex items-center gap-2">
          <Home size={16}/> Back to Home
        </Link>
        <Link to="/products" className="btn-secondary flex items-center gap-2">
          <Search size={16}/> Browse Products
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
