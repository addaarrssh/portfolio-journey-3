import { useState } from "react";
import Navbar from "./components/Navbar";
import StatusTicker from "./components/StatusTicker";
import Hero from "./components/Hero";
import Notebook from "./components/Notebook";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Timeline from "./components/Timeline";
import DrawingsTrail from "./components/DrawingsTrail";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import CommandPalette from "./components/CommandPalette";
import DebugMode from "./components/DebugMode";
import CursorTrail from "./components/CursorTrail";
import CustomCursor from "./components/CustomCursor";
import LoadingScreen from "./components/LoadingScreen";
import Marginalia from "./components/Marginalia";
import TrainProgress from "./components/TrainProgress";
import TimeGreeter from "./components/TimeGreeter";
import SecretsOverlay from "./components/SecretsOverlay";
import WindDriver from "./components/WindDriver";
import QuestLog from "./components/QuestLog";
import CreditsMode from "./components/CreditsMode";
import InkDivider from "./components/InkDivider";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="visible">
      <StatusTicker />
      <Navbar />
      <div className="relative z-0">
        <main>
          <Hero />
          <Notebook />
          <Skills />
          <Projects />
          <Timeline />
          <InkDivider color="#b07a47" />
          <DrawingsTrail />
          <InkDivider color="#e8622c" />
          <Contact />
        </main>
        <Footer />
      </div>
      <BackToTop />
      <CommandPalette />
      <DebugMode />
      <CursorTrail />
      <CustomCursor />
      <Marginalia />
      <TrainProgress />
      <TimeGreeter />
      <SecretsOverlay />
      <WindDriver />
      <QuestLog />
      <CreditsMode />
      {loading && (
        <LoadingScreen
          onComplete={() => {
            setLoading(false);
            window.__introDone = true;
            window.dispatchEvent(new Event("intro-complete"));
          }}
        />
      )}
    </div>
  );
}

export default App;
