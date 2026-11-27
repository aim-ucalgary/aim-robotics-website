import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import About from "./sections/About";
import WhatWeDo from "./sections/WhatWeDo";
import Engineering from "./sections/Engineering";
import Research from "./sections/Research";
import SubTeams from "./sections/SubTeams";
import Sponsors from "./sections/Sponsors";
import Contact from "./sections/Contact";

function App() {
  // Reveal-on-scroll: one observer for the whole page. Any element with the
  // `reveal` class fades up the first time it scrolls into view (see globals.css).
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");

    // No IntersectionObserver (very old browsers): just show everything.
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <WhatWeDo />
        <Engineering />
        <Research />
        <SubTeams />
        <Sponsors />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
