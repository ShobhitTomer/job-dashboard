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
import { getApplications, getJobs, getNotifications } from "@/http/api";
import useTokenStore from "@/store";

const HomePage = () => {
  // Fetch data needed for dashboard
  const { data: jobsData } = useQuery({
    queryKey: ["dashboard-jobs"],
    queryFn: getJobs,
  });

  const { data: applicationsData } = useQuery({
    queryKey: ["dashboard-applications"],
    queryFn: () => getApplications(),
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const activeJobs =
    jobsData?.data?.filter((job) => new Date(job.expires_at) > new Date()) ||
    [];

  const recentApplications = applicationsData?.data?.slice(0, 5) || [];

  // Calculate stats
  const totalJobs = jobsData?.data?.length || 0;
  const totalApplications = applicationsData?.data?.length || 0;
  const pendingApplications =
    applicationsData?.data?.filter(
      (app) => app.status.toLowerCase() === "pending"
    ).length || 0;

  // Example application change data
  const applicationChange = 12; // This would come from your API
  const isPositiveChange = applicationChange >= 0;

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-0">
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
                  <p>No recent applications found</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Link to="/dashboard/jobs/create">Post a Job</Link>
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
                notificationsData.data.map((notification, index) => (
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
                  <Bell className="mx-auto h-12 w-12 opacity-20 mb-2" />
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
