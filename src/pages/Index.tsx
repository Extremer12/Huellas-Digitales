import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PublicarSection from "@/components/PublicarSection";
import AnimalesSection from "@/components/AnimalesSection";
import LostPetsSection from "@/components/LostPetsSection";
import AdoptedSection from "@/components/AdoptedSection";
import ComoAyudarSection from "@/components/ComoAyudarSection";
import Footer from "@/components/Footer";
import RegionSelector from "@/components/RegionSelector";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Index = () => {
  useScrollAnimation();
  const [searchParams] = useSearchParams();
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    const animalId = searchParams.get('animal');
    if (animalId) {
      setSelectedAnimalId(animalId);
      // Scroll to animals section
      setTimeout(() => {
        document.getElementById('animales')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      
      // Check if region is set
      if (!profileData?.country || !profileData?.province) {
        setShowRegionSelector(true);
      }
    }
  };
  
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <PublicarSection />
        <AnimalesSection initialSelectedAnimalId={selectedAnimalId} />
        <LostPetsSection />
        <AdoptedSection />
        <ComoAyudarSection />
      </main>
      <Footer />
      
      {/* Region Selector Modal */}
      {showRegionSelector && user && (
        <RegionSelector
          open={showRegionSelector}
          userId={user.id}
          onRegionSet={() => {
            setShowRegionSelector(false);
            checkUser();
          }}
        />
      )}
    </div>
  );
};

export default Index;
