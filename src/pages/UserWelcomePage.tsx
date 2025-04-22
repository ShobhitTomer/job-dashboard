import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, LogOut } from "lucide-react";
import { supabase } from "@/http/api";
import useTokenStore from "@/store";
import { useNavigate } from "react-router-dom";

const UserWelcomePage = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useTokenStore((state) => state);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    navigate("/auth/login");
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to GetAJob!
          </CardTitle>
          <CardDescription>
            Hello, {user?.user_metadata?.first_name || user?.email}!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-lg">
              Thank you for registering with our job portal. As a regular user,
              you can:
            </p>
            <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-2">
              <li>Browse job listings</li>
              <li>Apply to open positions</li>
              <li>Track your application status</li>
              <li>Update your profile and resume</li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              To access admin features for posting jobs and managing
              applications, please contact our support team to upgrade your
              account.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button
            variant="outline"
            className="w-full max-w-xs"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserWelcomePage;
