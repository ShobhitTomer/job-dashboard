import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/http/api";
import useTokenStore from "@/store";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Briefcase } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useTokenStore((state) => state);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setToken(response.data.accessToken);
      setUser(response.data.user);
      navigate("/dashboard/home");
    },
    onError: (error: any) => {
      setErrorMessage(
        error.message ||
          "Login failed. Please check your credentials and try again."
      );
    },
  });

  const handleLoginSubmit = () => {
    setErrorMessage(null);
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    mutation.mutate({ email, password });
  };

  return (
    <section className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">GetAJob Admin</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
            {errorMessage && (
              <div className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                {errorMessage}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              ref={passwordRef}
              id="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button
            onClick={handleLoginSubmit}
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>

          <div className="mt-4 text-center text-sm">
            Don't have an admin account?{" "}
            <Link
              to={"/auth/register"}
              className="text-primary underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
};

export default LoginPage;
