import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApplicationById, updateApplicationStatus } from "@/http/api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplicationById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => updateApplicationStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  // Handle status update
  const handleStatusUpdate = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-4 w-4 mr-1" />,
        };
      case "reviewing":
        return {
          variant: "outline",
          className: "bg-blue-100 text-blue-800",
          icon: <FileText className="h-4 w-4 mr-1" />,
        };
      case "interviewed":
        return {
          variant: "outline",
          className: "bg-purple-100 text-purple-800",
          icon: <User className="h-4 w-4 mr-1" />,
        };
      case "accepted":
        return {
          variant: "success",
          className: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
      case "rejected":
        return {
          variant: "destructive",
          className: "bg-red-100 text-red-800",
          icon: <XCircle className="h-4 w-4 mr-1" />,
        };
      default:
        return { variant: "outline", className: "", icon: null };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <Card className="my-6">
        <CardContent className="py-10">
          <div className="text-center">
            <h3 className="text-lg font-medium">
              Error loading application details
            </h3>
            <p className="text-muted-foreground mt-2">
              {error instanceof Error
                ? error.message
                : "Application not found or an error occurred."}
            </p>
            <Button className="mt-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const application = data.data;
  const statusInfo = getStatusBadge(application.status);
  const applicantName = `${application.user.first_name} ${application.user.last_name}`;
  const initials = `${application.user.first_name.charAt(
    0
  )}${application.user.last_name.charAt(0)}`;

  return (
    <>
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/home">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/applications">
                Applications
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{applicantName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Applicant</CardTitle>
                <Badge
                  variant={statusInfo.variant as any}
                  className={`flex items-center ${statusInfo.className}`}
                >
                  {statusInfo.icon}
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage
                    src={application.user.profile?.profile_picture}
                    alt={applicantName}
                  />
                  <AvatarFallback className="text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{applicantName}</h3>

                <div className="flex items-center justify-center mt-2">
                  <a
                    href={`mailto:${application.user.email}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {application.user.email}
                  </a>
                </div>

                {application.user.phone && (
                  <div className="flex items-center justify-center mt-1">
                    <a
                      href={`tel:${application.user.phone}`}
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      {application.user.phone}
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/dashboard/candidates/${application.user_id}`)
                    }
                  >
                    View Full Profile
                  </Button>

                  {application.user.profile?.resume && (
                    <Button
                      size="sm"
                      variant="secondary"
                      as="a"
                      href={application.user.profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Resume
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Application Timeline</h4>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Applied on:</span>{" "}
                    {format(new Date(application.applied_at), "PP")}
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Last updated:</span>{" "}
                    {format(new Date(application.updated_at), "PP")}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  Update Application Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("reviewing")}
                    disabled={
                      application.status === "reviewing" ||
                      updateStatusMutation.isPending
                    }
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Reviewing
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("interviewed")}
                    disabled={
                      application.status === "interviewed" ||
                      updateStatusMutation.isPending
                    }
                  >
                    <User className="h-3 w-3 mr-1" />
                    Interviewed
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleStatusUpdate("accepted")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={
                      application.status === "accepted" ||
                      updateStatusMutation.isPending
                    }
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={
                      application.status === "rejected" ||
                      updateStatusMutation.isPending
                    }
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
                {updateStatusMutation.isPending && (
                  <p className="text-xs text-muted-foreground">
                    Updating status...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                Application for{" "}
                <Link
                  to={`/dashboard/applications?jobId=${application.job_id}`}
                  className="font-medium hover:underline"
                >
                  {application.job.title}
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cover-letter">
                <TabsList className="mb-4">
                  <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                  <TabsTrigger value="job-details">Job Details</TabsTrigger>
                  <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="cover-letter"
                  className="p-4 bg-muted/30 rounded-md"
                >
                  {application.cover_letter ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">
                        {application.cover_letter}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No cover letter provided.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="job-details">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-primary" />
                        {application.job.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {application.job.company.name}
                      </p>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{application.job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline">
                          {application.job.job_type}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Job Description</h4>
                      <p className="text-sm">{application.job.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.job.required_skills
                          .split(",")
                          .map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="skills">
                  <div className="space-y-4">
                    {application.user.profile?.skills && (
                      <div>
                        <h4 className="font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.user.profile.skills
                            .split(",")
                            .map((skill, index) => (
                              <Badge key={index} variant="outline">
                                {skill.trim()}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {application.user.profile?.bio && (
                      <div>
                        <h4 className="font-medium mb-2">Bio</h4>
                        <p className="text-sm whitespace-pre-line">
                          {application.user.profile.bio}
                        </p>
                      </div>
                    )}

                    {application.user.profile?.experience && (
                      <div>
                        <h4 className="font-medium mb-2">Experience</h4>
                        <p className="text-sm whitespace-pre-line">
                          {application.user.profile.experience}
                        </p>
                      </div>
                    )}

                    {application.user.profile?.linkedin_url && (
                      <div>
                        <h4 className="font-medium mb-2">LinkedIn Profile</h4>
                        <a
                          href={application.user.profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {application.user.profile.linkedin_url}
                        </a>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetailPage;
