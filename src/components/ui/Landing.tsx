import { ChangeEvent, useEffect, useState } from "react";
import { FaKeyboard } from "react-icons/fa";
import { MdVideoCall } from "react-icons/md";

const LandingComponent = () => {
    const getFormattedDateTime = () => {
        const currentDateObj = new Date();

        // Format date and time
        const timeString = currentDateObj.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true }).toUpperCase(); // E.g., "12:47 AM"
        const dateString = currentDateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); // E.g., "Sun, Sep 29"
        
        return `${timeString} · ${dateString}`;
    };

    const [currDateTime, setCurrDateTime] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(true);

    useEffect(() => {
        setInterval(() => {
            setCurrDateTime(getFormattedDateTime());
        }, 1000)
    }, []);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        if(event.target.value.trim() === '') {
            setButtonDisabled(true);
        } else {
            setButtonDisabled(false);
        }
    }
    
    return <>
        <header className="flex justify-between px-4 py-3 h-[5%]">
            <h1 className="text-2xl">Call Buddy.</h1>
            <div>{currDateTime}</div>
        </header>

        <div className="grid grid-cols-2 px-[6em] h-[95%]">
            <div className="flex flex-col justify-center">
                <h1 className="text-5xl">Connecting you <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">seamlessly,</span><br />Anytime, Anywhere!</h1>
                <div className="flex relative pt-8">
                    <button className="flex items-center bg-blue-500 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-2xl bg-purple-600 mr-5">
                        <MdVideoCall size="1.5em" /> &nbsp; Start a call
                    </button>

                    <FaKeyboard size="1.5em" className="absolute left-[11.3em] top-[55%]" />
                    <input type="text" className="rounded-2xl pl-12 px-3 bg-neutral-700 border border-neutral-700 focus:ring-purple-700 focus:border-purple-700 w-4/12 mr-5" placeholder="Enter a code" onChange={handleInputChange}/>

                    <button className={`bg-transparent py-4 px-4 rounded-2xl ${buttonDisabled ? 'text-neutral-500' : 'text-purple-500 hover:bg-purple-300 hover:bg-opacity-5'}`} disabled={buttonDisabled ? true : false}>Join</button>
                </div>
            </div>
            <div>col</div>
        </div>
    </>
}

export default LandingComponent;