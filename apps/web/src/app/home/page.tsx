"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { PlusSeparator } from "@/components/ui/plus-separator";
import { cn } from "@/lib/utils";

const backgroundImageVariants = cva("", {
  variants: {
    variant: {
      contour:
        "bg-[url(/static/images/hero-background/contour_dark.svg)] bg-no-repeat bg-cover bg-position-[center_top_30svh] dark:bg-[url(/static/images/hero-background/contour_light.svg)]",
      blackhole:
        "bg-[url(/static/images/hero-background/blackhole_dark.png)] bg-no-repeat bg-cover bg-position-[center_top_3svh] dark:bg-[url(/static/images/hero-background/blackhole_light.png)]",
    },
  },
  defaultVariants: {
    variant: "contour",
  },
});

export default function HeroSection() {
  return (
    <section className="relative flex flex-col">
      <div
        className={cn(
          "inner relative flex h-[80vh] flex-col justify-around border-separator/10 border-x px-4 transition-all *:transition-all sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-16",
          backgroundImageVariants({ variant: "contour" })
        )}
      >
        <span className="flex flex-col *:transition-all lg:pb-64">
          <h1 className="font-medium font-montreal text-3xl sm:text-4xl lg:text-[2.5rem] lg:leading-14">
            hey, i&apos;m hexaa 👋
          </h1>
          <p className="max-w-[450px] text-xs leading-4 sm:text-sm lg:text-base lg:leading-5">
            a self-taught software engineer with a strong foundation in
            full-stack development, driven by a passion for building impactful
            solutions.
          </p>
        </span>
        <span className="flex w-full justify-center md:w-auto md:justify-end">
          <p className="w-full max-w-[350px] text-center font-montreal-mono text-muted-foreground text-xs sm:text-sm md:text-base lg:w-auto lg:pt-52 lg:text-end">
            &quot;a journey that began as a hobby and evolved into a deep
            commitment to technology and problem-solving.&quot;
          </p>
        </span>
      </div>
      <div className="border-separator/10 border-t">
        <div className="inner relative m-auto border-separator/10 border-x p-4">
          <span className="relative flex items-center justify-between font-montreal-mono text-xs opacity-90 transition-opacity duration-300 dark:opacity-75">
            <Link href="https://time.is/Jakarta" target="_blank">
              aa
            </Link>
            {/*<button type="button" onClick={cycleTheme}>
              <BauhausGenerator />
            </button>*/}
          </span>
          <PlusSeparator position={["top-left", "top-right"]} />
        </div>
      </div>
    </section>
  );
}
