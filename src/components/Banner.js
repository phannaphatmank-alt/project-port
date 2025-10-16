"use client";
import { Icon } from "@iconify/react";

const Banner = () => {
  return (
    <div className="text-center mb-10 md:mb-12">
      <div className="mb-5 flex justify-center">
        <Icon
          icon="game-icons:spell-book"
          className="h-15 w-15 text-[#0B1956]"
          aria-hidden
        />
      </div>
      <h1 className="text-4xl font-extrabold letter-spacing: 0.26px text-[#0B1956]">
        Portfolio
      </h1>
      <p className="mt-3 text-xl md:text-2xl font-semibold text-[#426CC2]">
        Save your projects and improve your skills
      </p>
    </div>
  );
};

export default Banner;
