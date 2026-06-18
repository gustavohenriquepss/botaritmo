import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Calendar from "./pages/Calendar";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import ResetPassword from "./pages/ResetPassword";
import EventRedirect from "./pages/EventRedirect";
import EditProfile from "./pages/EditProfile";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Discover />} />
      <Route path="/calendario" element={<Calendar />} />
      <Route path="/evento/:slug" element={<Index />} />
      <Route path="/event/:id" element={<EventRedirect />} />
      <Route path="/event/:id/edit" element={<EditEvent />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/perfil" element={<EditProfile />} />
      <Route path="/:handle" element={<PublicProfile />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
