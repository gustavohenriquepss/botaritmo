import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventMetaProps {
  date: string;
  time: string;
  targetDate?: string;
}

export const EventMeta: React.FC<EventMetaProps> = ({ date, time, targetDate }) => {
  const formattedDate = targetDate 
    ? format(new Date(targetDate), "dd 'de' MMMM, yyyy", { locale: ptBR })
    : date;

  return (
    <div className="flex items-start gap-[-1px] relative">
      <div className="flex justify-center items-center gap-2.5 relative bg-[#1A1A1A] px-2 h-[24px]">
        <time className="text-white text-[11px] font-normal uppercase relative">
          {formattedDate}
        </time>
      </div>
      <div className="flex justify-center items-center gap-2.5 border relative px-2 h-[24px] border-solid border-[#1A1A1A]">
        <time className="text-[#1A1A1A] text-[11px] font-normal uppercase relative">
          {time}
        </time>
      </div>
    </div>
  );
};
