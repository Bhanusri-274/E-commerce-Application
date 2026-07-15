import { Outlet } from "react-router-dom";
import Navbar          from "./Navbar";
import Footer          from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import useScrollToTop  from "../../hooks/useScrollToTop";

const PublicLayout = () => {
  useScrollToTop();
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PublicLayout;
