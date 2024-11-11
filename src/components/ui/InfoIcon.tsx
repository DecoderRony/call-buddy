import { ReactNode } from "react";

interface InfoIconProps {
  icon: ReactNode;
}

function InfoIcon({ icon }: Readonly<InfoIconProps>) {
  return (
    <div className="rounded-full bg-[rgba(0,0,0,0.4)] flex justify-center items-center p-2">
      {icon}
    </div>
  );
}

export default InfoIcon;
