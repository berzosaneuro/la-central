import Navbar from "@/components/berzosa/navbar";
import Hero from "@/components/berzosa/hero";
import About from "@/components/berzosa/about";
import Specialties from "@/components/berzosa/specialties";
import Manifesto from "@/components/berzosa/manifesto";
import Contact from "@/components/berzosa/contact";
import Footer from "@/components/berzosa/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Specialties />
      <Manifesto />
      <Contact />
      <Footer />
    </main>
  );
}
