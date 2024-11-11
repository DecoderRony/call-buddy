
interface InfoTextProps {
  text: string;
}

function InfoText({ text }: Readonly<InfoTextProps>) {
  return (
    <div className="rounded-lg bg-[rgba(0,0,0,0.4)] flex justify-center items-center p-1 px-3">
      <span className="line-clamp-1">{text}</span>
    </div>
  );
}

export default InfoText