import { useEffect, useState } from "react";
import JoinCall from "./JoinCall";
import StartCall from "./StartCall";
import Logo from "../../assets/logo.png";
import LogoText from "../../assets/logo-text.png";
import Image from "@/components/ui/Image";

const getFormattedDateTime = () => {
  const currentDateObj = new Date();

  // Format date and time
  const timeString = currentDateObj
    .toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    .toUpperCase(); // E.g., "12:47 AM"
  const dateString = currentDateObj.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  }); // E.g., "Sun, Sep 29"

  return `${timeString} · ${dateString}`;
};

const LandingPage = () => {
  const [currDateTime, setCurrDateTime] = useState("");

  useEffect(() => {
    setInterval(() => {
      setCurrDateTime(getFormattedDateTime());
    }, 1000);
  }, []);

  return (
    <div id="landing-page-container" className="relative flex flex-col h-full">
      <header className="flex justify-between items-center px-5 py-3 h-16">
        <div className="flex items-center h-full pt-2 gap-4">
          <Image src={Logo} className="h-full" alt="call-buddy" />
          <Image src={LogoText} className=" h-full mt-1" alt="call-buddy" />
        </div>
        <h2 className="hidden sm:block text-xl">{currDateTime}</h2>
      </header>

      <div className="grid grid-rows-2 2xl:grid-rows-1 2xl:grid-cols-2 px-4 2xl:px-[6em] h-full">
        <div className="flex flex-col justify-end 2xl:justify-center text-center 2xl:text-start px-16 2xl:px-0 pb-10 2xl:pb-0">
          <h1 className="text-4xl 2xl:text-5xl leading-snug font-medium line">
            Connecting you{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              seamlessly,
            </span>
            <br />
            Anytime, Anywhere!
          </h1>
        </div>

        <div className="flex flex-col 2xl:flex-row justify-start 2xl:justify-center items-center gap-3 pt-10 2xl:pt-0">
          <StartCall />
          <span className="text-gray-500 mx-6 text-sm font-semibold">or</span>
          <JoinCall />
        </div>
      </div>

      <div className="absolute bottom-3 w-full text-center">
        <h3 className="text-base font-semibold text-neutral-400">
          Made with &nbsp;&#10084;&nbsp; by HJ & AD
        </h3>
      </div>
    </div>
  );
};

export default LandingPage;
