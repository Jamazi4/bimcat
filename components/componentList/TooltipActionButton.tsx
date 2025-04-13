import { Dispatch, SetStateAction } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { AiOutlineReload } from "react-icons/ai";

type tooltipActionButtonProps = {
  action: Dispatch<SetStateAction<boolean>>;
  disabled: boolean;
  pending: boolean;
  icon: React.ReactNode;
  tooltip: string;
  destructive: boolean;
};

const TooltipActionButton = ({
  action,
  disabled,
  pending,
  icon,
  tooltip,
  destructive,
}: tooltipActionButtonProps) => {
  const className = `${destructive ? "text-destructive" : ""}`;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={disabled || pending}
            size="icon"
            variant="ghost"
            className={className}
            onClick={(e) => {
              e.stopPropagation();
              action(true);
            }}
          >
            {pending ? (
              <AiOutlineReload className="animate-spin w-10 h-10" />
            ) : (
              icon
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default TooltipActionButton;
