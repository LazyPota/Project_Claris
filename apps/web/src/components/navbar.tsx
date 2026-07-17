"use client";

import { Slot } from "@radix-ui/react-slot";
import { Undo, Waves } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PlusSeparator } from "@/components/ui/plus-separator";
import { Separator } from "@/components/ui/separator";
import { sidebarMenuButtonVariants } from "@/components/ui/sidebar";
import {
  backItems,
  EXCLUDED_PAGES,
  EXCLUDED_SECTIONS,
  navItems,
  separatorItems,
  shadeExcludeItems,
  TOP_LEVEL_SECTIONS,
} from "@/constants/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { labs } from "@/lib/source";
import { cn } from "@/lib/utils";

export default function NavbarClient() {
  const tree = labs.pageTree;
  const isMobile = useIsMobile({ breakpoint: 512 });
  const isInLabsBreakpoint = useIsMobile({ breakpoint: 1280 });

  const [isMounted, setIsMounted] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const isInLabsPage = pathname.startsWith("/labs/");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header>
      {matchPath(pathname, shadeExcludeItems) ? null : (
        <div
          className="-z-50 absolute top-0 right-0 left-0 mx-auto"
          style={{ filter: "blur(clamp(200px, 10vw, 250px))" }}
        >
          <span
            className="absolute top-0 right-0 left-0 m-0 mx-auto h-[25vh] w-[90vw] bg-[#1D1EF0] p-0 sm:h-[15vh] md:h-[10vh] md:w-[80vw] "
            style={{
              clipPath: "polygon(0% 51%, 50% 0%, 100% 51%, 100% 100%, 0% 100%)",
            }}
          />
        </div>
      )}
      <div
        className={cn(
          "fixed top-0 right-0 left-0 z-50 h-[var(--navbar-height)] border-separator/10 border-b p-4 backdrop-blur-sm transition duration-300",
          !isAtTop && "bg-background/50"
        )}
      >
        <div className="inner flex items-center justify-between md:px-8">
          {matchPath(pathname, separatorItems) && (
            <div className="inner absolute right-0 bottom-0 left-0">
              <PlusSeparator
                position={["bottom-left", "bottom-right"]}
                child={{
                  "bottom-left": { className: "-bottom-[5px] -left-[3px]" },
                  "bottom-right": { className: "-bottom-[5px] -right-[4px]" },
                }}
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            {isMounted &&
              (isMobile || (isInLabsPage && isInLabsBreakpoint)) && (
                <Drawer
                  open={open}
                  onOpenChange={setOpen}
                  direction={
                    isInLabsPage && isInLabsBreakpoint && !isMobile
                      ? "left"
                      : "top"
                  }
                >
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="gap-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      onClick={() => {
                        posthog.capture("buttonClicked", {
                          location: "navbar-mobile",
                          section: "main-nav",
                          value: "open-menu",
                        });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4!"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 9h16.5m-16.5 6.75h16.5"
                        />
                      </svg>
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="border-separator/10 bg-background/80 p-0 backdrop-blur-xl">
                    <DrawerTitle className="sr-only">
                      Navigation Menu
                    </DrawerTitle>
                    <div className="overflow-auto p-6">
                      <div className="flex flex-col space-y-3">
                        {isMobile &&
                          navItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => {
                                setOpen(false);
                                posthog.capture("buttonClicked", {
                                  location: "navbar-mobile",
                                  section: "main-nav",
                                  value: item.title.toLowerCase(),
                                });
                              }}
                              className="font-montreal text-2xl transition-colors hover:text-blue-600"
                            >
                              {item.title}
                            </Link>
                          ))}
                        {isInLabsPage &&
                          isInLabsBreakpoint &&
                          tree.children.length > 0 && (
                            <>
                              {isMobile && <Separator className="my-2 bg-separator/10" />}
                              <div>
                                <h2 className="mt-4 mb-2 font-mono font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
                                  Sections
                                </h2>
                                {TOP_LEVEL_SECTIONS.map(({ name, href }) => {
                                  return (
                                    <Slot
                                      key={name}
                                      data-active={pathname === href}
                                      className={cn(
                                        sidebarMenuButtonVariants(),
                                        "after:-inset-y-1 relative h-[30px] min-w-1/2 overflow-visible border border-transparent font-medium text-[0.8rem] after:absolute after:inset-x-0 after:z-0 after:rounded-md data-[active=true]:border-blue-500/20 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-600",
                                      )}
                                    >
                                      <Link
                                        href={href}
                                        onClick={() => {
                                          setOpen(false);
                                          posthog.capture("buttonClicked", {
                                            location: "navbar-mobile",
                                            section: "labs",
                                            value: `featured-${name.toLowerCase()}`,
                                          });
                                        }}
                                      >
                                        {name}
                                      </Link>
                                    </Slot>
                                  );
                                })}
                              </div>
                              {tree.children.map((item) => {
                                if (
                                  EXCLUDED_SECTIONS.includes(item.$id ?? "") ||
                                  item.name === "Root"
                                ) {
                                  return null;
                                }

                                return (
                                  <div key={item.$id}>
                                    <h2 className="mt-4 mb-2 font-mono font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
                                      {item.name}
                                    </h2>
                                    {item.type === "folder" && (
                                      <div>
                                        {item.children.map((item) => {
                                          return (
                                            item.type === "page" &&
                                            !EXCLUDED_PAGES.includes(
                                              item.url,
                                            ) && (
                                              <Slot
                                                key={item.url}
                                                data-active={
                                                  item.url === pathname
                                                }
                                                className={cn(
                                                  sidebarMenuButtonVariants(),
                                                  "after:-inset-y-1 relative h-[30px] min-w-1/2 overflow-visible border border-transparent font-medium text-[0.8rem] after:absolute after:inset-x-0 after:z-0 after:rounded-md data-[active=true]:border-blue-500/20 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-600",
                                                )}
                                              >
                                                <Link
                                                  href={item.url}
                                                  onClick={() => {
                                                    setOpen(false);
                                                    posthog.capture(
                                                      "buttonClicked",
                                                      {
                                                        location:
                                                          "navbar-mobile",
                                                        section: "labs",
                                                        value: `${item.url.split("/").pop()?.toLowerCase()}`,
                                                      },
                                                    );
                                                  }}
                                                >
                                                  {item.name}
                                                </Link>
                                              </Slot>
                                            )
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          )}
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold font-montreal text-lg tracking-tight"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
                <Waves className="h-4 w-4" />
              </div>
              clarias.
            </Link>
            {matchPath(pathname, backItems) && (
              <Link href="/blog" className="flex h-4 items-center">
                <Separator orientation="vertical" className="mr-0 ml-2 bg-separator/10" />
                <button type="button" className="py-2 pr-2 pl-4 text-muted-foreground transition hover:text-foreground">
                  <Undo size={16} />
                </button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-6">
            {isMounted && !isMobile && (
              <nav className="flex gap-1 transition-opacity duration-300">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-full px-3 py-1.5 font-medium font-mono text-muted-foreground text-sm capitalize transition-colors hover:bg-separator/10 hover:text-foreground"
                    onClick={() => {
                      posthog.capture("buttonClicked", {
                        location: "navbar",
                        section: "main-nav",
                        value: item.title.toLowerCase(),
                      });
                    }}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function matchPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern === pathname) return true;

    if (pattern.includes("/**")) {
      const basePattern = pattern.replace("/**", "");
      return pathname.startsWith(basePattern);
    }

    if (pattern.includes("/*")) {
      const regexPattern = pattern
        .split("/")
        .map((segment) => {
          if (segment === "*") return "[^/]+";
          return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("/");

      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(pathname);
    }

    return false;
  });
}
