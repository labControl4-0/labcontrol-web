import type { ReactNode } from "react";
import AuthShowcase from "./AuthShowcase";
import BrandMark from "./BrandMark";

interface AuthLayoutProps {
  children: ReactNode;
}

// Showcase on the left from lg up; on smaller screens only the form, with the brand on top
const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[#0B0F17] font-sans text-white">
      <AuthShowcase className="hidden flex-[999_1_560px] lg:flex" />

      <main className="flex min-w-0 flex-[1_1_440px] items-center justify-center bg-[#111827] px-6 py-12">
        <div className="flex w-full max-w-[380px] flex-col gap-7">
          <BrandMark className="lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
