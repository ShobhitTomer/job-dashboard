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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApplications, updateApplicationStatus } from "@/http/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  MoreHorizontal,
  Loader2,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

// Define Application interface
interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  resume: string;
  cover_letter: string;
  applied_at: string;
  updated_at: string;
  job: {
    id: string;
    title: string;
    company_id: string;
    company: {
      name: string;
    };
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profile: {
      bio: string;
      skills: string;
      resume: string;
      linkedin_url: string;
    };
  };
}

const ApplicationsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("jobId");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["applications", jobId],
    queryFn: () => getApplications(jobId || undefined),
    staleTime: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  // Filter applications by status
  const filteredApplications = statusFilter
    ? data?.data.filter((app: Application) => app.status === statusFilter)
    : data?.data;

  // Handle status change
  const handleFilterChange = (status: string | null) => {
    setStatusFilter(status);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      case "reviewing":
        return {
          variant: "outline",
          className: "bg-blue-100 text-blue-800",
          icon: <Eye className="h-3 w-3 mr-1" />,
        };
      case "interviewed":
        return {
          variant: "outline",
          className: "bg-purple-100 text-purple-800",
          icon: null,
        };
      case "accepted":
        return {
          variant: "success",
          className: "bg-green-100 text-green-800",
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        };
      case "rejected":
        return {
          variant: "destructive",
          className: "bg-red-100 text-red-800",
          icon: <XCircle className="h-3 w-3 mr-1" />,
        };
      default:
        return { variant: "outline", className: "", icon: null };
    }
  };

  // Handle status update
  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
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
            {jobId && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/jobs">Jobs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>Applications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {statusFilter ? `Status: ${statusFilter}` : "Filter by Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFilterChange(null)}>
              All Applications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("reviewing")}>
              Reviewing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("interviewed")}>
              Interviewed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("accepted")}>
              Accepted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("rejected")}>
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {jobId ? "Job Applications" : "All Applications"}
          </CardTitle>
          <CardDescription>
            {jobId
              ? "Manage applications for this job position."
              : "Review and manage all job applications."}
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
                Error loading applications:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredApplications?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                No applications found
                {statusFilter ? ` with status "${statusFilter}"` : ""}.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredApplications?.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  {!jobId && <TableHead>Job Position</TableHead>}
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Applied On
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application: Application) => {
                  const statusInfo = getStatusBadge(application.status);
                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.user.first_name}{" "}
                        {application.user.last_name}
                      </TableCell>
                      {!jobId && (
                        <TableCell>
                          <Link
                            to={`/dashboard/applications?jobId=${application.job_id}`}
                            className="hover:underline"
                          >
                            {application.job.title}
                          </Link>
                        </TableCell>
                      )}
                      <TableCell className="hidden md:table-cell">
                        {application.user.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusInfo.variant as any}
                          className={`flex items-center ${statusInfo.className}`}
                        >
                          {statusInfo.icon}
                          {application.status}
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
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link
                                to={`/dashboard/applications/${application.id}`}
                                className="w-full"
                              >
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                to={`/dashboard/candidates/${application.user_id}`}
                                className="w-full"
                              >
                                View Candidate Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(application.id, "pending")
                              }
                            >
                              Set as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(application.id, "reviewing")
                              }
                            >
                              Set as Reviewing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(
                                  application.id,
                                  "interviewed"
                                )
                              }
                            >
                              Set as Interviewed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(application.id, "accepted")
                              }
                            >
                              Accept Application
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(application.id, "rejected")
                              }
                            >
                              Reject Application
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
      </Card>
    </div>
  );
};

export default ApplicationsPage;
