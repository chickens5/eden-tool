import { useState, useEffect } from 'react';
import EdenTool from './components/EdenTool';
import LandingPage from './components/LandingPage';
import ASCIIText from './components/ASCIIText';
import Blog from './writing/Blog';
import USReparations from './components/USReparations'

import './App.css';

// Hexagon loading spinner component
const HexagonLoader = () => (
  <div className="loader-overlay">
    <div className="hexagon-loader">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="hexagon-edge" style={{ '--delay': `${i * 0.1}s` }} />
      ))}
      <div className="hexagon-center">Loading…</div>
    </div>
  </div>
);

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCardClick = (cardIndex) => {
    // External links — open in new tab
    if (cardIndex === 1) {
      window.open('https://chickens5.github.io/barista/', '_blank', 'noopener,noreferrer');
      return;
    }
    if (cardIndex === 4) {
      window.open('https://github.com/chickens5', '_blank', 'noopener,noreferrer');
      return;
    }
    if (cardIndex === 5) {
      window.open('https://github.com/chickens5/grimlock', '_blank', 'noopener,noreferrer');
      return;
    }

    // Internal views
    let newView = null;
    if (cardIndex === 0) newView = 'eden-tool';
    else if (cardIndex === 2) newView = 'blog';
    else if (cardIndex === 3) newView = 'us-reparations';

    if (newView) {
      setIsTransitioning(true);
      setCurrentView(newView);
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setCurrentView('landing');
  };

  // Hide loader once view renders
  useEffect(() => {
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timer);
  }, [currentView]);

  if (currentView === 'eden-tool') {
    return <EdenTool onBack={handleBack} />;
  }

  if (currentView === 'blog') {
    return <Blog onBack={handleBack} />;
  }

  if (currentView === 'us-reparations') {
    return <USReparations onBack={handleBack} />;
  }

  return (
    <>
      {isTransitioning && <HexagonLoader />}
      <div className='landing'>
        <div className='landing-header'>
          <ASCIIText
            text="EDEN"
            enableWaves
            asciiFontSize={55}
          />
        </div>
        <LandingPage onCardClick={handleCardClick} />
      </div>
    </>
  );
}

export default App;
