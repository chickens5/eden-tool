import { useState } from 'react';
import EdenTool from './components/EdenTool';
import LandingPage from './components/LandingPage';
import ASCIIText from './components/ASCIIText';
import Blog from './writing/Blog';

import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'eden-tool', 'blog'

  const handleCardClick = (cardIndex) => {
    if (cardIndex === 0) {
      setCurrentView('eden-tool');
    } else if (cardIndex === 2) {
      setCurrentView('blog');
    }
  };

  const handleBack = () => {
    setCurrentView('landing');
  };

  if (currentView === 'eden-tool') {
    return <EdenTool onBack={handleBack} />;
  }

  if (currentView === 'blog') {
    return <Blog onBack={handleBack} />;
  }

  return (
    <>
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
