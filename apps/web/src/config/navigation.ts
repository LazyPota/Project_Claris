import {
  LayoutDashboard,
  Droplets,
  Warehouse,
  BadgeDollarSign,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Environment",
    href: "/environment",
    icon: Droplets,
  },
  {
    label: "Harvest",
    href: "/harvest",
    icon: Warehouse,
  },
  {
    label: "Finance",
    href: "/finance",
    icon: BadgeDollarSign,
  },
];
