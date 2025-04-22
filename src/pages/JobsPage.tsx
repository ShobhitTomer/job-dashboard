import { Badge } from "@/components/ui/badge";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJobs, getCompanyByUserId } from "@/http/api";
import { useQuery } from "@tanstack/react-query";
import {
  CirclePlus,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useTokenStore from "@/store";

// Define Job interface
interface Job {
  id: string;
  title: string;
  company_id: string;
  location: string;
  job_type: string;
  salary_range: string;
  required_skills: string;
  description: string;
  posted_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  company: {
    name: string;
  };
}

const JobsPage = () => {
  const navigate = useNavigate();
  const { user } = useTokenStore((state) => state);

  // Fetch user's company first
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company-profile", user?.id],
    queryFn: () => getCompanyByUserId(user?.id),
    enabled: !!user?.id,
  });

  // Then fetch jobs for that company
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs", companyData?.data?.id],
    queryFn: () => getJobs(companyData?.data?.id),
    staleTime: 10000,
    enabled: !!companyData?.data?.id, // Only run if company exists
  });

  const hasCompany = !!companyData?.data;

  // Redirect to create company page if no company
  const handleCreateJobClick = () => {
    if (!hasCompany) {
      navigate("/dashboard/company");
    } else {
      navigate("/dashboard/jobs/create");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/home">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Jobs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={handleCreateJobClick}>
          <CirclePlus size={20} />
          <span className="ml-2">
            {hasCompany ? "Post New Job" : "Create Company First"}
          </span>
        </Button>
      </div>

      {/* No company alert card */}
      {!isLoadingCompany && !hasCompany && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Company Profile Required
              </h3>
              <p className="text-yellow-700">
                You need to create a company profile before you can post jobs.
              </p>
              <Button
                variant="outline"
                className="mt-2 border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                onClick={() => navigate("/dashboard/company")}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Create Company Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
          <CardDescription>
            {hasCompany
              ? `Manage job postings for ${companyData?.data?.name} and view their application status.`
              : "Create a company profile to start posting jobs."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading || isLoadingCompany) && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <div className="rounded-md bg-destructive/15 p-4 text-center text-destructive">
              <p>
                Error loading jobs:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          )}

          {!isLoading &&
            !isLoadingCompany &&
            hasCompany &&
            data?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No job listings found for your company.</p>
                <Button onClick={() => navigate("/dashboard/jobs/create")}>
                  <CirclePlus size={16} className="mr-2" />
                  Create Your First Job Posting
                </Button>
              </div>
            )}

          {!isLoading &&
            !isLoadingCompany &&
            hasCompany &&
            data?.data?.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Job Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Salary Range
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Posted At
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Expires At
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((job: Job) => {
                    const isExpired = new Date(job.expires_at) < new Date();
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.title}
                        </TableCell>
                        <TableCell>{job.company.name}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.job_type}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {job.salary_range}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(job.posted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={isExpired ? "destructive" : "outline"}
                          >
                            {new Date(job.expires_at).toLocaleDateString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Link
                                  to={`/dashboard/applications?jobId=${job.id}`}
                                  className="w-full"
                                >
                                  View Applications
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link
                                  to={`/dashboard/jobs/edit/${job.id}`}
                                  className="w-full"
                                >
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
        </CardContent>
        {!isLoading &&
          !isLoadingCompany &&
          hasCompany &&
          data?.data?.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>{data?.data?.length || 0}</strong> jobs
              </div>
            </CardFooter>
          )}
      </Card>
    </div>
  );
};

export default JobsPage;
