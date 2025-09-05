import ChallengeBanner from './components/ChallengeBanner';
import AnimatedCat from './components/AnimatedCat';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-blue-50">
      <ChallengeBanner />
      <AnimatedCat />
      <ScrollToTop />
    </div>
  );
}