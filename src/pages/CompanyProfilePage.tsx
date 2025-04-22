import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { supabase, getCompanyByUserId } from "@/http/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Building2, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useTokenStore from "@/store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  headquarters: z.string().min(2, {
    message: "Headquarters must be at least 2 characters.",
  }),
});

const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useTokenStore((state) => state);
  const [hasCompany, setHasCompany] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  // Fetch if the user already has a company
  const { data: companyData, isLoading } = useQuery({
    queryKey: ["company-profile", user?.id],
    queryFn: () => getCompanyByUserId(user?.id),
    enabled: !!user?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      industry: "",
      headquarters: "",
    },
  });

  // Update form with existing data if available
  useEffect(() => {
    if (companyData?.data) {
      const company = companyData.data;
      setHasCompany(true);
      form.reset({
        name: company.name || "",
        industry: company.industry || "",
        headquarters: company.headquarters || "",
      });
    }
  }, [companyData, form]);

  // Direct Supabase mutation instead of using a potentially problematic API function
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      setMessage(null);

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user?.id) {
        throw new Error("User not authenticated");
      }

      const companyData = {
        ...values,
        user_id: userData.user.id,
        updated_at: new Date().toISOString(),
      };

      let response;

      if (hasCompany && companyData?.data?.id) {
        // Update existing company
        response = await supabase
          .from("companies")
          .update(companyData)
          .eq("id", companyData.data.id)
          .select();
      } else {
        // Create new company
        companyData.created_at = new Date().toISOString();
        response = await supabase
          .from("companies")
          .insert([companyData])
          .select();
      }

      if (response.error) {
        console.error("Error saving company:", response.error);
        throw response.error;
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      setMessage({
        type: "success",
        text: hasCompany
          ? "Company updated successfully!"
          : "Company created successfully!",
      });

      // Wait a moment to show the success message before navigating
      setTimeout(() => {
        navigate("/dashboard/jobs");
      }, 2000);
    },
    onError: (error) => {
      console.error("Error saving company:", error);
      setMessage({
        type: "error",
        text: `Error: ${error.message || "Failed to save company data"}`,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/home">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Company Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <Link to="/dashboard/home">
                <Button variant={"outline"}>
                  <span className="ml-2">Cancel</span>
                </Button>
              </Link>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <LoaderCircle className="animate-spin mr-2" />
                )}
                <span className="ml-2">
                  {hasCompany ? "Update Company" : "Create Company"}
                </span>
              </Button>
            </div>
          </div>

          {message && (
            <Alert
              className={`mt-4 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {message.type === "success" && (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {message.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                {hasCompany
                  ? "Update Company Profile"
                  : "Create Company Profile"}
              </CardTitle>
              <CardDescription>
                {hasCompany
                  ? "Update your company information below."
                  : "You need to create a company profile before posting jobs."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g. Acme Corporation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g. Technology, Healthcare, Finance"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headquarters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headquarters</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. New York, NY, USA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </section>
  );
};

export default CompanyProfilePage;
