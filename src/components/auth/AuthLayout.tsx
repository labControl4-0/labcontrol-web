import type { ReactNode } from "react";
import AuthShowcase from "./AuthShowcase";
import BrandMark from "./BrandMark";

interface AuthLayoutProps {
  children: ReactNode;
}

// Showcase on the left from lg up; on smaller screens only the form, with the brand on top.
// Locked to the viewport height so the page never scrolls; the form side only scrolls
// as a last resort when the window is too short to fit it (e.g. phone in landscape).
const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex h-dvh overflow-hidden bg-[#0B0F17] font-sans text-white">
      <AuthShowcase className="hidden flex-[999_1_560px] lg:flex" />

      <main className="flex min-h-0 min-w-0 flex-[1_1_440px] overflow-y-auto bg-[#111827] px-6 py-8">
        <div className="m-auto flex w-full max-w-[380px] flex-col gap-7">
          <BrandMark className="lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
