import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Briefcase,
  FileText,
  Users,
  Clock,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  getApplications,
  getJobs,
  getNotifications,
  getCompanyByUserId,
} from "@/http/api";
import useTokenStore from "@/store";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useTokenStore((state) => state);

  // First fetch company data
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company-profile", user?.id],
    queryFn: () => getCompanyByUserId(user?.id),
    enabled: !!user?.id,
  });

  // Then fetch jobs for that company
  const { data: jobsData } = useQuery({
    queryKey: ["dashboard-jobs", companyData?.data?.id],
    queryFn: () => getJobs(companyData?.data?.id),
    enabled: !!companyData?.data?.id, // Only run if company exists
  });

  // Fetch applications for the company's jobs
  const { data: applicationsData } = useQuery({
    queryKey: ["dashboard-applications", companyData?.data?.id],
    queryFn: () => getApplications(),
    enabled: !!companyData?.data?.id,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  // Filter applications to only show those for the company's jobs
  const companyJobIds = jobsData?.data?.map((job) => job.id) || [];
  const filteredApplications =
    applicationsData?.data?.filter((app) =>
      companyJobIds.includes(app.job_id)
    ) || [];

  const recentApplications = filteredApplications.slice(0, 5);

  // Calculate stats for filtered data
  const hasCompany = !!companyData?.data;
  const totalJobs = jobsData?.data?.length || 0;
  const totalApplications = filteredApplications.length || 0;
  const pendingApplications =
    filteredApplications.filter((app) => app.status.toLowerCase() === "pending")
      .length || 0;

  // Example application change data
  const applicationChange = 12; // This would come from your API
  const isPositiveChange = applicationChange >= 0;

  // Get active jobs
  const activeJobs =
    jobsData?.data?.filter((job) => new Date(job.expires_at) > new Date()) ||
    [];

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-0">
        {!isLoadingCompany && !hasCompany && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-4 p-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">
                  Complete Your Setup
                </h3>
                <p className="text-yellow-700 mb-2">
                  Create your company profile to start posting jobs and managing
                  applications.
                </p>
                <Button
                  onClick={() => navigate("/dashboard/company")}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Company Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {activeJobs.length} active jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span
                  className={
                    isPositiveChange ? "text-green-500" : "text-red-500"
                  }
                >
                  {isPositiveChange ? (
                    <ChevronUp className="inline h-3 w-3" />
                  ) : (
                    <ChevronDown className="inline h-3 w-3" />
                  )}
                  {Math.abs(applicationChange)}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Applications to review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalJobs
                  ? Math.round((totalApplications / totalJobs) * 10) / 10
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Applications per job
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Recent applications submitted to your job postings.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link to="/dashboard/applications">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Job Position
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="font-medium">
                            {application.user.first_name}{" "}
                            {application.user.last_name}
                          </div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {application.user.email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Link
                            to={`/dashboard/applications?jobId=${application.job_id}`}
                            className="hover:underline"
                          >
                            {application.job.title}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className="text-xs" variant="outline">
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(
                            application.applied_at
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>
                    {hasCompany
                      ? "No recent applications found"
                      : "Create a company to view applications"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      hasCompany
                        ? navigate("/dashboard/jobs/create")
                        : navigate("/dashboard/company")
                    }
                  >
                    {hasCompany ? "Post a Job" : "Create Company"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {notificationsData?.data && notificationsData.data.length > 0 ? (
                notificationsData.data.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-4"
                  >
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarFallback>
                        {notification.message.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>No notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HomePage;
