import { Divider } from '../../components/Divider/Divider';
import { HeroSection, UIDesignSection, AboutSection } from './components';

export const HomePage = () => {
  return (
    <>
      <div className='flex flex-col items-center w-full animate-fade-in-down'>
        <HeroSection />
        {/* <GoogleAd /> */}
        <Divider />
        <UIDesignSection />
        {/* <GoogleAd /> */}
        <Divider />
        <AboutSection />
        {/* <GoogleAd /> */}
      </div>
    </>
  );
};

export default HomePage;
