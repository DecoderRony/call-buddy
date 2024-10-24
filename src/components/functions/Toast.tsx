import { MdError } from "react-icons/md";
import { toast } from "sonner";

interface ShowToast {
  title: string;
  description?: string;
  isError?: boolean;
}

export function showToast({ title, description, isError }: ShowToast) {
  if (isError)
    return toast(title, {
      description: description,
      icon: <MdError size="2em" />,
      classNames: {
        title: "text-sm font-bold ml-3",
        description: "text-xs font-semibold ml-3",
        icon: "ml-1",
      },
    });

  return toast(title, {
    description: description,
    classNames: {
      title: "text-sm font-bold",
      description: "text-xs font-semibold",
    },
  });
}
