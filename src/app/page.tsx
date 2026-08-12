import { DesktopCover } from "@/components/landing/DesktopCover";
import { MobileSignupLanding } from "@/components/landing/MobileSignupLanding";

export default function HomePage() {
  return (
    <>
      <MobileSignupLanding />
      <DesktopCover />
    </>
  );
}
