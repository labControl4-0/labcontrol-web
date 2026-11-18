import { Outlet, useLocation } from "react-router-dom";
import AuthShowcase from "./AuthShowcase";
import BrandMark from "./BrandMark";

// Layout route shared by "/" and "/register": the showcase stays mounted while navigating.
// Showcase on the left from lg up; on smaller screens only the form, with the brand on top.
// Locked to the viewport height so the page never scrolls; the form side only scrolls
// as a last resort when the window is too short to fit it (e.g. phone in landscape).
const AuthLayout = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0B0F17] font-sans text-white">
      <AuthShowcase className="hidden flex-[999_1_560px] lg:flex" />

      <main className="flex min-h-0 min-w-0 flex-[1_1_440px] overflow-y-auto bg-[#111827] px-6 py-8 [@media(max-height:640px)]:py-4">
        {/* Keyed by route: only the form card animates when switching screens */}
        <div
          key={pathname}
          className="auth-card-in m-auto flex w-full max-w-[380px] flex-col gap-7 [@media(max-height:640px)]:gap-5"
        >
          <BrandMark className="lg:hidden" />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
