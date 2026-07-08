import { Header } from "@/components/Header"
import { About } from "@/components/About"
import { Services } from "@/components/Services"
import { WorkExperience } from "@/components/WorkExperience"
import { Technologies } from "@/components/Technologies"
import { Projects } from "@/components/Projects"
import { Connect } from "@/components/Connect"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <main>
      <Header />
      <About />
      <Services />
      <WorkExperience />
      <Technologies />
      <Projects />
      <Connect />
      <Footer />
    </main>
  )
}
