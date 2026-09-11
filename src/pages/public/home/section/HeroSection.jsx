import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const fallbackSlides = [
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

const HeroSection = ({ slides = [] }) => {
  const activeSlides =
    slides.length > 0
      ? slides.filter((slide) => slide.active !== false)
      : fallbackSlides;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setCurrentSlide(0);
  }, [activeSlides.length]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!activeSlides.length) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length,
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const slide = activeSlides[currentSlide] || fallbackSlides[0];

  return (
    <section className="relative min-h-90 overflow-hidden sm:min-h-107.5 lg:min-h-137.5">
      {/* Background Image */}
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 h-full w-full object-cover object-[68%_center] transition-opacity duration-700 sm:object-center"
      />

      {/* Overlay */}
      <div className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-90 max-w-7xl items-center px-4 sm:min-h-107.5 sm:px-6 lg:min-h-137.5">
        <div className="text-primary-600 max-w-xs sm:max-w-xl lg:max-w-2xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-yellow-300 uppercase sm:mb-3 sm:text-sm sm:tracking-widest">
            {slide.subtitle}
          </p>

          <h1 className="text-2xl leading-tight font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            {slide.title}
          </h1>

          <p className="mt-3 max-w-sm text-sm text-gray-500 sm:mt-4 sm:max-w-md sm:text-base md:mt-5 md:max-w-lg md:text-lg">
            {slide.description}
          </p>

          <Link
            to={slide.buttonUrl || "/products"}
            className="mt-5 inline-flex rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-yellow-300 sm:mt-6 sm:px-6 sm:py-3 sm:text-base md:mt-8"
          >
            {slide.buttonText || "Explore"}
          </Link>
        </div>
      </div>

      {/* Slider Controls - Bottom Center */}
      <div className="absolute right-0 bottom-4 left-0 z-20 sm:bottom-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 sm:gap-4 sm:px-6">
          {/* Dots */}
          <div className="flex gap-2">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all sm:h-2.5 ${
                  index === currentSlide
                    ? "w-6 bg-yellow-400 sm:w-8"
                    : "w-2 bg-white/50 hover:bg-white/70 sm:w-2.5"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {activeSlides.length > 1 && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={goToPrev}
                className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
              >
                Prev
              </button>
              <button
                onClick={goToNext}
                className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
