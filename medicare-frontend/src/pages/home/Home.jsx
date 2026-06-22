import React from "react";
import HomeLayout from "../../components/layouts/HomeLayout";

// Import section components
import Hero from "./Hero";
import Features from "./Features";
import Testimonials from "./Testimonials";

export default function Home() {
  return (
    <HomeLayout>
      <Hero />
      <Features />
      <Testimonials />
    </HomeLayout>
  );
}
