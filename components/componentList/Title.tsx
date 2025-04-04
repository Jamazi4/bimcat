import DownloadIfcButton from "../editor/DownloadIfcButton";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Star } from "lucide-react";

const Title = ({ text }: { text: string }) => {
  return (
    <div className="my-6">
      <div className="flex justify-between">
        <h1 className="font-bold text-xl text-primary">{text}</h1>
        {/* Title buttons */}
        <div className="space-x-4">
          <DownloadIfcButton />
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
