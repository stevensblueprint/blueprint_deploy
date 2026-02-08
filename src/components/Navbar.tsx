import logoBanner from "@/assets/logo_banner.png";

export function Navbar() {
  return (
    <nav className="w-full h-16 bg-[#0078E8] flex items-center px-6 sticky top-0 z-50">
      <div className="max-w-7xl w-full mx-auto flex items-center">
        <img src={logoBanner} alt="Blueprint Logo" className="h-8 brightness-0 invert" />
      </div>
    </nav>
  );
}
