import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserApplications } from "@/http/api";
import useTokenStore from "@/store";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  PlusCircle,
  Search,
  SlidersHorizontal,
  User,
  XCircle,
} from "lucide-react";

const UserApplicationsPage = () => {
  const navigate = useNavigate();
  const { user } = useTokenStore((state) => state);
  const [tab, setTab] = useState("all");

  // Fetch user's applications
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-applications", user?.id],
    queryFn: () => getUserApplications(),
    enabled: !!user?.id,
  });

  // Get status badge variant and icon
  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();

    switch (lowerStatus) {
      case "pending":
        return {
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          label: "Pending Review",
        };
      case "reviewing":
        return {
          variant: "secondary",
          className: "bg-blue-100 text-blue-800",
          icon: <Eye className="h-3.5 w-3.5 mr-1" />,
          label: "Under Review",
        };
      case "interviewed":
        return {
          variant: "secondary",
          className: "bg-purple-100 text-purple-800",
          icon: <User className="h-3.5 w-3.5 mr-1" />,
          label: "Interviewed",
        };
      case "accepted":
        return {
          variant: "secondary",
          className: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Accepted",
        };
      case "rejected":
        return {
          variant: "secondary",
          className: "bg-red-100 text-red-800",
          icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Rejected",
        };
      default:
        return {
          variant: "outline",
          className: "",
          icon: null,
          label: status,
        };
    }
  };

  // Filter applications based on selected tab
  const filterApplications = () => {
    if (!data?.data) return [];

    if (tab === "all") return data.data;

    return data.data.filter((app) => {
      const lowerStatus = app.status.toLowerCase();

      if (tab === "active") {
        return ["pending", "reviewing", "interviewed"].includes(lowerStatus);
      }

      if (tab === "accepted") {
        return lowerStatus === "accepted";
      }

      if (tab === "rejected") {
        return lowerStatus === "rejected";
      }

      return true;
    });
  };

  const filteredApplications = filterApplications();

  const tabCounts = {
    all: data?.data?.length || 0,
    active:
      data?.data?.filter((app) =>
        ["pending", "reviewing", "interviewed"].includes(
          app.status.toLowerCase()
        )
      ).length || 0,
    accepted:
      data?.data?.filter((app) => app.status.toLowerCase() === "accepted")
        .length || 0,
    rejected:
      data?.data?.filter((app) => app.status.toLowerCase() === "rejected")
        .length || 0,
  };

  // Get application date relative to now (e.g., "2 days ago")
  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-start gap-6">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Applications</h1>
            <p className="text-muted-foreground">
              Track and manage your job applications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/jobs")}>
              <Search className="mr-2 h-4 w-4" />
              Browse Jobs
            </Button>
            <Button onClick={() => navigate("/jobs")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Apply to Jobs
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Tabs defaultValue="all" onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2 bg-gray-100">
                  {tabCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                <Badge variant="secondary" className="ml-2 bg-blue-100">
                  {tabCounts.active}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted
                <Badge variant="secondary" className="ml-2 bg-green-100">
                  {tabCounts.accepted}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                <Badge variant="secondary" className="ml-2 bg-red-100">
                  {tabCounts.rejected}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-red-500 mb-4">
                      Error loading your applications. Please try again.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't applied to any jobs yet.
                    </p>
                    <Button onClick={() => navigate("/jobs")}>
                      Browse Jobs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredApplications.map((application) => {
                    const status = getStatusBadge(application.status);

                    return (
                      <Card key={application.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-9 p-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                    <Link to={`/jobs/${application.job_id}`}>
                                      {application.job.title}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {application.job.company.name} •{" "}
                                    {application.job.location}
                                  </p>
                                </div>

                                <Badge
                                  variant={status.variant as any}
                                  className={`flex items-center ${status.className}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1.5" />
                                  Applied{" "}
                                  {getRelativeDate(application.applied_at)}
                                </div>
                                {application.updated_at !==
                                  application.applied_at && (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1.5" />
                                    Updated{" "}
                                    {getRelativeDate(application.updated_at)}
                                  </div>
                                )}
                              </div>

                              {application.cover_letter && (
                                <div className="mt-4">
                                  <p className="font-medium text-sm mb-1">
                                    Your Cover Letter:
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.cover_letter}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-3 bg-muted/30 p-6 flex flex-col justify-center">
                              <Button
                                className="mb-2"
                                onClick={() =>
                                  navigate(`/applications/${application.id}`)
                                }
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  navigate(`/jobs/${application.job_id}`)
                                }
                              >
                                View Job
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-0">
              {/* This will reuse the same content as "all" but with filtered applications */}
              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <SlidersHorizontal className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No active applications found.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Active applications include those with status: Pending,
                      Reviewing, or Interviewed.
                    </p>
                    <Button onClick={() => setTab("all")}>
                      View All Applications
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredApplications.map((application) => {
                    const status = getStatusBadge(application.status);

                    return (
                      <Card key={application.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-9 p-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                    <Link to={`/jobs/${application.job_id}`}>
                                      {application.job.title}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {application.job.company.name} •{" "}
                                    {application.job.location}
                                  </p>
                                </div>

                                <Badge
                                  variant={status.variant as any}
                                  className={`flex items-center ${status.className}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1.5" />
                                  Applied{" "}
                                  {getRelativeDate(application.applied_at)}
                                </div>
                                {application.updated_at !==
                                  application.applied_at && (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1.5" />
                                    Updated{" "}
                                    {getRelativeDate(application.updated_at)}
                                  </div>
                                )}
                              </div>

                              {application.cover_letter && (
                                <div className="mt-4">
                                  <p className="font-medium text-sm mb-1">
                                    Your Cover Letter:
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.cover_letter}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-3 bg-muted/30 p-6 flex flex-col justify-center">
                              <Button
                                className="mb-2"
                                onClick={() =>
                                  navigate(`/applications/${application.id}`)
                                }
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  navigate(`/jobs/${application.job_id}`)
                                }
                              >
                                View Job
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="mt-0">
              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No accepted applications found.
                    </p>
                    <Button onClick={() => navigate("/jobs")}>
                      Apply to More Jobs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredApplications.map((application) => {
                    const status = getStatusBadge(application.status);

                    return (
                      <Card key={application.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-9 p-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                    <Link to={`/jobs/${application.job_id}`}>
                                      {application.job.title}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {application.job.company.name} •{" "}
                                    {application.job.location}
                                  </p>
                                </div>

                                <Badge
                                  variant={status.variant as any}
                                  className={`flex items-center ${status.className}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1.5" />
                                  Applied{" "}
                                  {getRelativeDate(application.applied_at)}
                                </div>
                                {application.updated_at !==
                                  application.applied_at && (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1.5" />
                                    Updated{" "}
                                    {getRelativeDate(application.updated_at)}
                                  </div>
                                )}
                              </div>

                              {application.cover_letter && (
                                <div className="mt-4">
                                  <p className="font-medium text-sm mb-1">
                                    Your Cover Letter:
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.cover_letter}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-3 bg-muted/30 p-6 flex flex-col justify-center">
                              <Button
                                className="mb-2"
                                onClick={() =>
                                  navigate(`/applications/${application.id}`)
                                }
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  navigate(`/jobs/${application.job_id}`)
                                }
                              >
                                View Job
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <XCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No rejected applications found.
                    </p>
                    <Button onClick={() => navigate("/jobs")}>
                      Browse More Jobs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredApplications.map((application) => {
                    const status = getStatusBadge(application.status);

                    return (
                      <Card key={application.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-9 p-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                    <Link to={`/jobs/${application.job_id}`}>
                                      {application.job.title}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {application.job.company.name} •{" "}
                                    {application.job.location}
                                  </p>
                                </div>

                                <Badge
                                  variant={status.variant as any}
                                  className={`flex items-center ${status.className}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1.5" />
                                  Applied{" "}
                                  {getRelativeDate(application.applied_at)}
                                </div>
                                {application.updated_at !==
                                  application.applied_at && (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1.5" />
                                    Updated{" "}
                                    {getRelativeDate(application.updated_at)}
                                  </div>
                                )}
                              </div>

                              {application.cover_letter && (
                                <div className="mt-4">
                                  <p className="font-medium text-sm mb-1">
                                    Your Cover Letter:
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.cover_letter}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-3 bg-muted/30 p-6 flex flex-col justify-center">
                              <Button
                                className="mb-2"
                                onClick={() =>
                                  navigate(`/applications/${application.id}`)
                                }
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  navigate(`/jobs/${application.job_id}`)
                                }
                              >
                                View Job
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserApplicationsPage;
