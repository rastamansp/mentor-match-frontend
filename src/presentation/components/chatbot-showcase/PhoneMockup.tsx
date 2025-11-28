import { ReactNode } from "react";
import { Battery, Signal, Wifi } from "lucide-react";

interface PhoneMockupProps {
  children: ReactNode;
}

export const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="relative w-[375px] h-[812px] bg-black rounded-[3rem] p-3 shadow-2xl animate-float">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10" />
      
      <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden flex flex-col">
        <div className="bg-white px-4 py-2 flex items-center justify-between flex-shrink-0">
          <span className="text-gray-900 text-sm font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3.5 h-3.5 text-gray-900" />
            <Wifi className="w-3.5 h-3.5 text-gray-900" />
            <Battery className="w-4 h-4 text-gray-900" />
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

