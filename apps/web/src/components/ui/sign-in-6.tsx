"use client";

import { Cpu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function IoTIcon() {
  return <Cpu className="size-4" />;
}

export function SignIn6() {
  function handleGuest() {
    document.cookie = "clarias-auth=guest; path=/; max-age=86400";
    window.location.href = "/";
  }

  function handleIoT() {
    toast("IoT login is coming soon!", {
      description: "This feature is still under development. Stay tuned.",
    });
  }

  return (
    <Card className="grid w-full gap-0 p-0 md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-primary to-primary/80 p-10 text-primary-foreground md:flex">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
            <div className="size-3 rotate-45 rounded-[3px] bg-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight">
            Project Clarias
          </span>
        </div>

        <h2 className="relative mt-auto max-w-[15ch] text-balance font-semibold text-[26px] leading-[1.15] tracking-tight">
          Smart aquaculture, simplified.
        </h2>

        <div className="relative mt-8 flex items-center gap-3">
          <span className="text-primary-foreground/85 text-xs">
            Monitor water quality, track harvests, and manage your ponds — all
            in one place.
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5 p-8">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-lg">Welcome</span>
          <span className="text-muted-foreground text-xs">
            Choose how you'd like to continue.
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={handleIoT}
          >
            <IoTIcon />
            Continue with IoT
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground uppercase">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button className="w-full" onClick={handleGuest}>
            Continue as Guest
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-xs">
          Guest access provides full dashboard visibility with sample data.
        </p>
      </div>
    </Card>
  );
}

export default SignIn6;
