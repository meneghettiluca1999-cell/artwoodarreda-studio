"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, FolderOpen, Settings, LogOut } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nuovo Progetto", href: "/projects/new", icon: PlusCircle },
  { name: "Tutti i Progetti", href: "/dashboard", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-full">
      <div className="flex h-16 shrink-0 items-center px-6">
        {/* Logo is shown in the top header, so this space is intentionally left empty */}
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:bg-muted/10 hover:text-foreground",
                  "group flex items-center px-3 py-2 text-sm rounded-md transition-colors"
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground",
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted/10 hover:text-foreground transition-colors">
          <Settings className="mr-3 h-5 w-5" />
          Impostazioni
        </button>
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted/10 hover:text-foreground transition-colors mt-1">
          <LogOut className="mr-3 h-5 w-5" />
          Esci
        </button>
      </div>
    </div>
  );
}
