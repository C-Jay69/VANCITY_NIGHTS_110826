import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MenuIcon,
  XIcon,
  MapPinIcon,
  PenLineIcon,
  LogOutIcon,
  UserIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useAuth } from "@/hooks/use-auth.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Bars", href: "/venues?category=bar" },
  { label: "Clubs", href: "/venues?category=club" },
  { label: "Casinos", href: "/venues?category=casino" },
  { label: "All Venues", href: "/venues" },
];

function AdminLink({ onClick, className }: { onClick?: () => void; className?: string }) {
  const isAdmin = useQuery(api.admin.isAdmin);
  if (!isAdmin) return null;
  return (
    <Link
      to="/admin"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors",
        className,
      )}
    >
      <ShieldCheckIcon className="h-3.5 w-3.5" />
      Admin
    </Link>
  );
}

function UserMenu() {
  const { user, signout } = useAuth();
  const [open, setOpen] = useState(false);
  const name = user?.name ?? user?.email ?? "Account";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <span className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
          {initial}
        </span>
        <span className="hidden sm:block max-w-[100px] truncate">{name}</span>
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-48 bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs text-muted-foreground truncate">{name}</p>
              </div>
              <Link
                to="/submit"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <PenLineIcon className="h-4 w-4" />
                Submit a Spot
              </Link>
              <div onClick={() => setOpen(false)}>
                <AdminLink className="w-full px-3 py-2.5" />
              </div>
              <button
                onClick={() => { setOpen(false); void signout(); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
              >
                <LogOutIcon className="h-4 w-4" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
            <MapPinIcon className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">VanCity</span>
              <span className="text-accent">Nights</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Authenticated>
              <Link
                to="/submit"
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <PenLineIcon className="h-3.5 w-3.5" />
                Submit a Spot
              </Link>
              <AdminLink />
            </Authenticated>
          </nav>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            <AuthLoading>
              <Skeleton className="h-8 w-24 rounded-md" />
            </AuthLoading>
            <Unauthenticated>
              <SignInButton />
            </Unauthenticated>
            <Authenticated>
              <UserMenu />
            </Authenticated>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Authenticated>
                <Link
                  to="/submit"
                  className="flex items-center gap-1.5 text-sm font-medium text-primary py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <PenLineIcon className="h-3.5 w-3.5" />
                  Submit a Spot
                </Link>
                <AdminLink onClick={() => setMobileOpen(false)} className="py-1" />
              </Authenticated>
              <div className="pt-2 border-t border-border">
                <Unauthenticated>
                  <SignInButton />
                </Unauthenticated>
                <Authenticated>
                  <MobileAuthButtons onClose={() => setMobileOpen(false)} />
                </Authenticated>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileAuthButtons({ onClose }: { onClose: () => void }) {
  const { user, signout } = useAuth();
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground truncate max-w-[180px]">
        {user?.name ?? user?.email ?? "Signed in"}
      </span>
      <button
        onClick={() => { onClose(); void signout(); }}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      >
        <LogOutIcon className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}