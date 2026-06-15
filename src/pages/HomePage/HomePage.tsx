import { GoogleAd } from '@/src/components/GoogleAd/GoogleAd';
import { HeroSection, UIDesignSection, AboutSection } from './components';

export const HomePage = () => {
  return (
    <div className='h-screen overflow-y-scroll overflow-x-hidden [scroll-snap-type:y_mandatory] bg-background scrollbar-hide'>
      <div className='flex flex-col items-center w-full animate-fade-in-top'>
        <HeroSection />
        {/* <GoogleAd /> */}
        {/* <Divider /> */}
        <UIDesignSection />
        <GoogleAd />
        {/* <AboutSection /> */}
        {/* <GoogleAd /> */}
      </div>
    </div>
  );
};

export default HomePage;
