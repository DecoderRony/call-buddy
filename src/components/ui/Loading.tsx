type LoadingProps = {
  text?: string;
};

const Loading = ({ text = "loading" }: Readonly<LoadingProps>) => {
  return (
    <div className="fixed top-0 left-0 z-10 bg-[#141313] h-dvh w-full flex flex-col items-center justify-center gap-5">
      <div className="3-dots flex gap-3">
        <span
          className={
            "w-4 h-4 bg-white rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 dot1"
          }
        ></span>
        <span
          className={
            "w-4 h-4 bg-white rounded-full bg-gradient-to-r from-purple-500 to-purple-400 dot2"
          }
        ></span>
        <span
          className={
            "w-4 h-4 bg-white rounded-full bg-gradient-to-r from-pink-400 to-pink-500 dot3"
          }
        ></span>
      </div>
      <div className="text-2xl">{text}</div>
    </div>
  );
};

export default Loading;
