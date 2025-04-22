import { useEffect } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import useTokenStore from "@/store";
import { supabase } from "@/http/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Briefcase, FileText, LogOut, Menu, User } from "lucide-react";

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, clearAuth } = useTokenStore((state) => state);

  useEffect(() => {
    // If user is admin, redirect to admin dashboard
    if (user?.role === "admin") {
      navigate("/dashboard/home");
    }
  }, [user, navigate]);

  if (!token) {
    // Store the current location to redirect back after login
    return (
      <Navigate
        to={`/auth/login?returnUrl=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    navigate("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.user_metadata?.first_name || "";
    const lastName = user.user_metadata?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6" />
              <span className="font-bold">GetAJob</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                to="/jobs"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Browse Jobs
              </Link>
              <Link
                to="/applications"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                My Applications
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-6">
                  <Link to="/" className="flex items-center gap-2">
                    <Briefcase className="h-6 w-6" />
                    <span className="font-bold">GetAJob</span>
                  </Link>
                  <nav className="flex flex-col gap-4">
                    <Link
                      to="/jobs"
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      Browse Jobs
                    </Link>
                    <Link
                      to="/applications"
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/profile"
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      Profile
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.user_metadata?.profile_picture}
                      alt={getUserInitials()}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.first_name}{" "}
                      {user?.user_metadata?.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/applications">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Applications</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <Outlet />
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GetAJob. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
