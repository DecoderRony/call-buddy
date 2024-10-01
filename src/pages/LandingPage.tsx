import { ChangeEvent, useEffect, useState } from "react";
import { FaKeyboard } from "react-icons/fa";
import { MdVideoCall } from "react-icons/md";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const LandingPage = () => {
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

  const [currDateTime, setCurrDateTime] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    setInterval(() => {
      setCurrDateTime(getFormattedDateTime());
    }, 1000);
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.trim() === "") {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  };

  return (
    <>
      <header className="flex justify-between px-4 py-3 h-[5%]">
        <h1 className="text-2xl">Call Buddy.</h1>
        <div>{currDateTime}</div>
      </header>

      <div className="grid grid-cols-2 px-[6em] h-[95%]">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl">
            Connecting you{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              seamlessly,
            </span>
            <br />
            Anytime, Anywhere!
          </h1>
        </div>
        <div className="flex justify-center items-center">
          <div className="">
            <Button onClick={() => {}}>
              <MdVideoCall size="1.5em" /> &nbsp; Start a call
            </Button>
          </div>

          <span className="text-gray-500 mx-6 text-sm font-semibold">or</span>

          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter Call Id"
              onChange={handleInputChange}
              icon={<FaKeyboard size="1.5em" />}
            />

            <Button variant="text" disabled={buttonDisabled ? true : false}>
              Join
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
