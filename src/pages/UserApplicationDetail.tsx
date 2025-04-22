import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserApplicationById } from "@/http/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react";

const UserApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch application details
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-application", id],
    queryFn: () => getUserApplicationById(id!),
    enabled: !!id,
  });

  // Get status badge information
  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();

    switch (lowerStatus) {
      case "pending":
        return {
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-4 w-4 mr-1" />,
          label: "Pending Review",
          description:
            "Your application has been submitted and is awaiting review.",
          timeline: 1,
        };
      case "reviewing":
        return {
          variant: "secondary",
          className: "bg-blue-100 text-blue-800",
          icon: <Eye className="h-4 w-4 mr-1" />,
          label: "Under Review",
          description:
            "Your application is currently being reviewed by the hiring team.",
          timeline: 2,
        };
      case "interviewed":
        return {
          variant: "secondary",
          className: "bg-purple-100 text-purple-800",
          icon: <User className="h-4 w-4 mr-1" />,
          label: "Interviewed",
          description: "You've completed an interview for this position.",
          timeline: 3,
        };
      case "accepted":
        return {
          variant: "secondary",
          className: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          label: "Accepted",
          description: "Congratulations! Your application has been accepted.",
          timeline: 4,
        };
      case "rejected":
        return {
          variant: "secondary",
          className: "bg-red-100 text-red-800",
          icon: <XCircle className="h-4 w-4 mr-1" />,
          label: "Rejected",
          description: "Your application was not selected for this position.",
          timeline: 4,
        };
      default:
        return {
          variant: "outline",
          className: "",
          icon: null,
          label: status,
          description: "Application status",
          timeline: 1,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load application details. The application may have been
            removed or is no longer available.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate("/dashboard/applications")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const application = data.data;
  const status = getStatusBadge(application.status);
  const isRejected = application.status.toLowerCase() === "rejected";
  const isAccepted = application.status.toLowerCase() === "accepted";
  const isComplete = isRejected || isAccepted;

  // Format the application date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>

        <h1 className="text-3xl font-bold">Application Details</h1>
        <p className="text-muted-foreground">
          Review the status and details of your job application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    {application.job.title}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Building2 className="h-4 w-4 mr-1.5" />
                    {application.job.company.name}
                  </CardDescription>
                </div>

                <Badge
                  variant={status.variant as any}
                  className={`flex items-center ${status.className} px-3 py-1.5 text-sm`}
                >
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  {application.job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {application.job.job_type}
                </div>
                {application.job.salary_range && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    {application.job.salary_range}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Applied on {formatDate(application.applied_at)}
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h3 className="text-lg font-medium mb-2">Application Status</h3>
                <Card className={`${status.className} border-none`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {status.icon && (
                          <div className="h-6 w-6 flex items-center justify-center">
                            {status.icon}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{status.label}</h4>
                        <p className="text-sm mt-1">{status.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Application Timeline */}
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Application Timeline
                </h3>
                <div className="space-y-6 relative pl-8 before:absolute before:left-3 before:top-1 before:h-full before:w-px before:bg-border">
                  <div className="relative">
                    <div
                      className={`absolute left-[-24px] top-1 h-4 w-4 rounded-full bg-primary border-2 border-background`}
                    />
                    <h4 className="font-medium">Application Submitted</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(application.applied_at)}
                    </p>
                  </div>

                  <div className="relative">
                    <div
                      className={`absolute left-[-24px] top-1 h-4 w-4 rounded-full ${
                        status.timeline >= 2 ? "bg-primary" : "bg-muted"
                      } border-2 border-background`}
                    />
                    <h4
                      className={`font-medium ${
                        status.timeline < 2 ? "text-muted-foreground" : ""
                      }`}
                    >
                      Under Review
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {application.status.toLowerCase() === "reviewing"
                        ? `Since ${formatDate(application.updated_at)}`
                        : status.timeline >= 2
                        ? "Your application was reviewed"
                        : "Waiting for review"}
                    </p>
                  </div>

                  <div className="relative">
                    <div
                      className={`absolute left-[-24px] top-1 h-4 w-4 rounded-full ${
                        status.timeline >= 3 ? "bg-primary" : "bg-muted"
                      } border-2 border-background`}
                    />
                    <h4
                      className={`font-medium ${
                        status.timeline < 3 ? "text-muted-foreground" : ""
                      }`}
                    >
                      Interview Stage
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {application.status.toLowerCase() === "interviewed"
                        ? `Interview completed on ${formatDate(
                            application.updated_at
                          )}`
                        : status.timeline >= 3
                        ? "You completed the interview process"
                        : "Waiting for interview invitation"}
                    </p>
                  </div>

                  <div className="relative">
                    <div
                      className={`absolute left-[-24px] top-1 h-4 w-4 rounded-full ${
                        status.timeline >= 4 ? "bg-primary" : "bg-muted"
                      } border-2 border-background`}
                    />
                    <h4
                      className={`font-medium ${
                        status.timeline < 4 ? "text-muted-foreground" : ""
                      }`}
                    >
                      {isAccepted
                        ? "Application Accepted"
                        : isRejected
                        ? "Application Rejected"
                        : "Final Decision"}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isComplete
                        ? `Decision made on ${formatDate(
                            application.updated_at
                          )}`
                        : "Awaiting final decision"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {application.cover_letter && (
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Your Cover Letter
                  </h3>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                        <p className="text-sm whitespace-pre-line">
                          {application.cover_letter}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between pt-0">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/applications")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Applications
              </Button>

              <Button onClick={() => navigate(`/jobs/${application.job_id}`)}>
                View Job Details
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Company
                </h3>
                <p>{application.job.company.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Position
                </h3>
                <p>{application.job.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Location
                </h3>
                <p>{application.job.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Employment Type
                </h3>
                <p>{application.job.job_type}</p>
              </div>

              {application.job.salary_range && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Salary Range
                  </h3>
                  <p>{application.job.salary_range}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Posted On
                </h3>
                <p>{formatDate(application.job.posted_at)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Application Date
                </h3>
                <p>{formatDate(application.applied_at)}</p>
              </div>

              {application.updated_at !== application.applied_at && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </h3>
                  <p>{formatDate(application.updated_at)}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/jobs/${application.job_id}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Full Job Posting
              </Button>
            </CardFooter>
          </Card>

          {isComplete && (
            <Card
              className={`mt-6 ${
                isAccepted ? "border-green-200" : "border-red-200"
              }`}
            >
              <CardHeader
                className={`pb-2 ${
                  isAccepted ? "text-green-800" : "text-red-800"
                }`}
              >
                <CardTitle className="flex items-center">
                  {isAccepted ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" /> Application
                      Accepted
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" /> Application Rejected
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {isAccepted
                    ? "Congratulations! Your application has been accepted. The employer may contact you soon with more details."
                    : "Thank you for your interest. Unfortunately, your application was not selected for this position."}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isAccepted ? "default" : "outline"}
                  className={`w-full ${
                    isAccepted ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => navigate("/jobs")}
                >
                  {isAccepted
                    ? "View More Jobs at This Company"
                    : "Browse More Jobs"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserApplicationDetail;
