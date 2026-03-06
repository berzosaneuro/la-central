import Navbar from "@/components/berzosa/navbar";
import Hero from "@/components/berzosa/hero";
import Method from "@/components/berzosa/method";
import MeditationsPreview from "@/components/berzosa/meditations-preview";
import CoursePreview from "@/components/berzosa/course-preview";
import Pricing from "@/components/berzosa/pricing";
import About from "@/components/berzosa/about";
import Manifesto from "@/components/berzosa/manifesto";
import Contact from "@/components/berzosa/contact";
import Footer from "@/components/berzosa/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Method />
      <MeditationsPreview />
      <CoursePreview />
      <Pricing />
      <About />
      <Manifesto />
      <Contact />
      <Footer />
    </main>
  );
}
