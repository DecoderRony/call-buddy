import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import Image from "@/components/ui/Image";
import Logo from "@/assets/logo.png";
import LogoText from "@/assets/logo-text.png";

function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="h-dvh flex flex-col">
      <header className="flex justify-between items-center px-5 py-3 h-16">
        <div className="flex items-center h-full pt-2 gap-4">
          <Image src={Logo} className="h-full" alt="call-buddy" />
          <Image src={LogoText} className=" h-full mt-1" alt="call-buddy" />
        </div>
      </header>

      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-9xl font-bold">404</div>
        <div className="text-2xl mt-2">Uh Oh! It looks like you are lost.</div>
        <Button className="mt-5" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
