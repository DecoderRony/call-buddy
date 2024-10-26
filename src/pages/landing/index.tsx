import { useEffect, useState } from "react";
import JoinCall from "./JoinCall";
import StartCall from "./StartCall";

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
    <>
      <header className="flex justify-between px-2 sm:px-4 py-3 h-[5%]">
        <h1 className="text-base sm:text-xl lg:text-2xl">Call Buddy.</h1>
        <h2 className="text-sm sm:text-md lg:text-lg">{currDateTime}</h2>
      </header>

      <div className="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 px-4 sm:px-[6em] py-10 sm:py-0 h-[95%]">
        <div className="flex flex-col justify-between sm:justify-center">
          {/* hero for small devices */}
          <h1 className="text-5xl sm:text-5xl sm:hidden leading-snug text-center">
            Connecting you<br />{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              seamlessly,
            </span>
            <br />
            Anytime,<br />Anywhere!
          </h1>

          {/* hero for devices > sm */}
          <h1 className="text-4xl sm:text-5xl hidden sm:block">
            Connecting you{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              seamlessly,
            </span>
            <br />
            Anytime, Anywhere!
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-end sm:justify-center items-center gap-8 sm:gap-0">
          <StartCall />
          <span className="text-gray-500 mx-6 text-sm font-semibold">
            <div className="rounded-full border-2 border-gray-500 px-4 py-3 sm:border-none sm:px-0 sm:py-0">
              or
            </div>
          </span>
          <JoinCall />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
