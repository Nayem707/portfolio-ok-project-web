import React, { useState, useEffect } from "react";

const HeroSection = () => {
  const slides = [
    {
      id: 1,
      image: "/image/hero1.png",
      subtitle: "Welcome to Our Store",
      title: "Discover Something Amazing",
      description:
        "Explore our latest collection and find products that perfectly match your style and needs.",
      buttonText: "Explore Now",
    },
    {
      id: 2,
      image: "/image/hero2.png",
      subtitle: "New Arrivals",
      title: "Summer Collection 2026",
      description:
        "Stay ahead of the trends with our newest summer arrivals. Fresh styles, unbeatable prices.",
      buttonText: "Shop Now",
    },
    {
      id: 3,
      image: "/image/hero3.png",
      subtitle: "Special Offer",
      title: "Up to 50% Off",
      description:
        "Don't miss out on our biggest sale of the season. Limited time offer on selected items.",
      buttonText: "Grab Deal",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative min-h-[550px] overflow-hidden">
      {/* Background Image */}
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
      />

      {/* Overlay */}
      <div className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[550px] max-w-7xl items-center px-6">
        <div className="text-primary-600 max-w-2xl">
          <p className="mb-3 text-sm font-semibold tracking-widest text-yellow-300 uppercase">
            {slide.subtitle}
          </p>

          <h1 className="text-4xl leading-tight font-bold md:text-6xl">
            {slide.title}
          </h1>

          <p className="mt-5 max-w-lg text-base text-gray-500 md:text-lg">
            {slide.description}
          </p>

          <button className="mt-8 rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-gray-900 transition hover:bg-yellow-300">
            {slide.buttonText}
          </button>
        </div>
      </div>

      {/* Slider Controls - Bottom Center */}
      <div className="absolute right-0 bottom-6 left-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-6">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-yellow-400"
                    : "w-2.5 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
