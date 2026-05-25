import { About } from "./components/About";
import { Contact } from "./components/Contact";
import Home from "./components/Home";
import { Projects } from "./components/Projects";
import { ScrollToTop } from "./components/ScrollToTop";

export default function Landing() {
  return (
    <>
      <Home />
      <About />
      <Projects />
      <Contact />
      <ScrollToTop />
    </>
  );
}
