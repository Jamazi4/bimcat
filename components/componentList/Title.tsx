import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { DownloadIcon, Star } from "lucide-react";

const Title = ({ text }: { text: string }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        <h1 className="font-bold text-xl text-primary">{text}</h1>
        {/* Title buttons */}
        <div className="space-x-4">
          <Button size="icon" variant="ghost" className="cursor-pointer">
            <DownloadIcon />
          </Button>
          <Button size="icon" variant="ghost" className="cursor-pointer">
            <Star />
          </Button>
        </div>
      </div>
      <Separator className="mt-2" />
    </div>
  );
};
export default Title;
