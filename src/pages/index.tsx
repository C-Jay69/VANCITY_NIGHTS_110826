import Navbar from "./_components/Navbar.tsx";
import Hero from "./_components/Hero.tsx";
import CategoryStrip from "./_components/CategoryStrip.tsx";
import FeaturedVenues from "./_components/FeaturedVenues.tsx";
import HowItWorks from "./_components/HowItWorks.tsx";
import InstagramStrip from "./_components/InstagramStrip.tsx";
import Footer from "./_components/Footer.tsx";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <CategoryStrip />
      <FeaturedVenues />
      <HowItWorks />
      <InstagramStrip />
      <Footer />
    </div>
  );
}
