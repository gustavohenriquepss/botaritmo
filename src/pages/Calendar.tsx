import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
  broadcasts_brazil_game: boolean;
}

type ViewMode = 'month' | 'week';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('id, slug, title, date, time, background_image_url, target_date, address, broadcasts_brazil_game')
      .order('target_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const getEventsForDay = (day: Date): Event[] => {
    return events.filter(event => {
      const eventDate = parseISO(event.target_date);
      return isSameDay(eventDate, day);
    });
  };

  const getDaysToDisplay = (): Date[] => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  };

  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDay(day);
    }
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const days = getDaysToDisplay();
  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Calendário de Eventos | Bota Ritmo"
        description="Veja todos os eventos em formato de calendário"
      />
      <Navbar />

      <main className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-medium uppercase tracking-tight">
              Calendário
            </h1>

            {/* View Toggle */}
            <div className="flex items-center gap-0">
              <button
                onClick={() => setViewMode('month')}
                className={`h-[34px] px-4 text-[11px] font-medium uppercase border border-black transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`h-[34px] px-4 text-[11px] font-medium uppercase border border-black border-l-0 transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Semana
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={navigatePrevious}
                aria-label={viewMode === 'month' ? 'Mês anterior' : 'Semana anterior'}
                className="w-[34px] h-[34px] flex items-center justify-center border border-black bg-white hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={navigateNext}
                aria-label={viewMode === 'month' ? 'Próximo mês' : 'Próxima semana'}
                className="w-[34px] h-[34px] flex items-center justify-center border border-black border-l-0 bg-white hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                aria-label="Ir para hoje"
                className="h-[34px] px-4 text-[11px] font-medium uppercase border border-black border-l-0 bg-white hover:bg-gray-100 transition-colors"
              >
                Hoje
              </button>
            </div>

            <h2 className="text-lg md:text-xl font-medium uppercase">
              {viewMode === 'month' 
                ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
                : `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "d 'de' MMMM", { locale: ptBR })} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d 'de' MMMM", { locale: ptBR })}`
              }
            </h2>
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-sm text-black/60 uppercase">Carregando...</div>
            </div>
          ) : (
            <div className="border border-black">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 border-b border-black">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 md:p-3 text-center text-[10px] md:text-[11px] font-medium uppercase bg-black text-white"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className={`grid grid-cols-7 ${viewMode === 'week' ? '' : ''}`}>
                {days.map((day, index) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        min-h-[80px] md:min-h-[120px] p-2 border-b border-r border-black
                        ${index % 7 === 0 ? '' : ''}
                        ${!isCurrentMonth && viewMode === 'month' ? 'bg-gray-50' : 'bg-white'}
                        ${hasEvents ? 'cursor-pointer hover:bg-gray-50' : ''}
                        transition-colors
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <span
                          className={`
                            text-sm md:text-base font-medium
                            ${isToday ? 'w-7 h-7 flex items-center justify-center bg-black text-white' : ''}
                            ${!isCurrentMonth && viewMode === 'month' ? 'text-black/30' : 'text-black'}
                          `}
                        >
                          {format(day, 'd')}
                        </span>

                        {/* Event indicators */}
                        <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                          {dayEvents.slice(0, viewMode === 'week' ? 5 : 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-[9px] md:text-[10px] font-medium uppercase px-1 py-0.5 truncate ${event.broadcasts_brazil_game ? 'bg-[#FFDF00] text-black' : 'bg-brand text-black'}`}
                              title={event.broadcasts_brazil_game ? `🇧🇷 ${event.title} (Brasil ao vivo)` : event.title}
                            >
                              {event.broadcasts_brazil_game && <span aria-hidden="true">🇧🇷 </span>}
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > (viewMode === 'week' ? 5 : 2) && (
                            <div className="text-[9px] md:text-[10px] text-black/60">
                              +{dayEvents.length - (viewMode === 'week' ? 5 : 2)} mais
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Day Events Modal */}
      {selectedDay && (
        <div 
          className="fixed inset-0 bg-black/50 z-[4000] flex items-center justify-center p-4"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="bg-white border border-black w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-black bg-black text-white">
              <h3 className="text-sm font-medium uppercase">
                {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                aria-label="Fechar"
                className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Events List */}
            <div className="overflow-y-auto max-h-[60vh]">
              {selectedDayEvents.length === 0 ? (
                <div className="p-6 text-center text-sm text-black/60">
                  Nenhum evento neste dia
                </div>
              ) : (
                <div className="divide-y divide-black">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/evento/${event.slug}`)}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        {event.background_image_url && (
                          <div 
                            className="w-16 h-16 flex-shrink-0 bg-cover bg-center border border-black"
                            style={{ backgroundImage: `url(${event.background_image_url})` }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium uppercase truncate">
                            {event.title}
                          </h4>
                          <p className="text-[11px] text-black/60 mt-1">
                            {event.time}
                          </p>
                          <p className="text-[10px] text-black/40 mt-0.5 truncate">
                            {event.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
