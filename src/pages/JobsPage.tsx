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
import { getJobs } from "@/http/api";
import { useQuery } from "@tanstack/react-query";
import { CirclePlus, MoreHorizontal, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
    staleTime: 10000, // in Milli-seconds
  });

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
        <Link to="/dashboard/jobs/create">
          <Button>
            <CirclePlus size={20} />
            <span className="ml-2">Post New Job</span>
          </Button>
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
          <CardDescription>
            Manage your job postings and view their application status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
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

          {!isLoading && !isError && (
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
                      <TableCell className="font-medium">{job.title}</TableCell>
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
                        <Badge variant={isExpired ? "destructive" : "outline"}>
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
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{data?.data?.length || 0}</strong> jobs
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobsPage;
