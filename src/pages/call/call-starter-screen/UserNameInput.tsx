import Input from "@/components/ui/Input";
import { ChangeEvent, KeyboardEvent, useEffect, useRef } from "react";

interface UserNameInputProps {
  userName: string;
  onUserNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPressEnter: () => void;
}

function UserNameInput({
  userName,
  onUserNameChange,
  onPressEnter,
}: Readonly<UserNameInputProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // focus input element
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onPressEnter();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-xl md:text-2xl font-medium">
        What should we call you?
      </h3>
      <Input
        ref={inputRef}
        onKeyDown={handleInputKeyDown}
        variant="dark"
        value={userName}
        className="text-center"
        onChange={onUserNameChange}
      />
    </div>
  );
}

export default UserNameInput;
