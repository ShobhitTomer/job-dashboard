import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobById, applyForJob, checkApplicationExists } from "@/http/api";
import useTokenStore from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Send,
  XCircle,
} from "lucide-react";

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token } = useTokenStore((state) => state);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);

  // Fetch job details
  const {
    data: jobData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["job-detail", id],
    queryFn: () => getJobById(id!),
    enabled: !!id,
  });

  // Check if user has already applied
  const { data: applicationData, isLoading: checkingApplication } = useQuery({
    queryKey: ["job-application-check", id, user?.id],
    queryFn: () => checkApplicationExists(id!, user?.id),
    enabled: !!id && !!user?.id && !!token,
  });

  // Apply for job mutation
  const applyMutation = useMutation({
    mutationFn: () => applyForJob(id!, { cover_letter: coverLetter }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job-application-check", id, user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["user-applications"] });
    },
    onError: (error: any) => {
      setApplyError(
        error.message || "Failed to submit application. Please try again."
      );
    },
  });

  const handleApply = () => {
    setApplyError(null);
    applyMutation.mutate();
  };

  // Prepare tags
  const formatJobTags = (job: any) => {
    if (!job) return [];

    const tags = [];
    if (job.job_type) tags.push(job.job_type);
    if (job.location) tags.push(job.location);
    return tags;
  };

  // Format skills from string or array
  const formatSkills = (skills: string | string[]) => {
    if (!skills) return [];
    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return skills;
  };

  // Handle expiration status
  const isExpired = jobData?.data
    ? new Date(jobData.data.expires_at) < new Date()
    : false;
  const isApplied = applicationData?.data?.exists;
  const hasAlreadyApplied = isApplied || applyMutation.isSuccess;

  if (isLoading || checkingApplication) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !jobData?.data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load job details. The job may have been removed or is no
            longer available.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const job = jobData.data;
  const jobTags = formatJobTags(job);
  const skills = formatSkills(job.required_skills);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center mt-2">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-lg">{job.company.name}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isExpired && (
              <Badge variant="destructive" className="text-sm">
                <Clock className="mr-1 h-3.5 w-3.5" /> Expired
              </Badge>
            )}
            {jobTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground mb-6">
                {job.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {job.location}
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    {job.salary_range}
                  </div>
                )}
                <div className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1.5" />
                  Posted {new Date(job.posted_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  Closes {new Date(job.expires_at).toLocaleDateString()}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>

              {skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {job.company.about && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>About {job.company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{job.company.about}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
              <CardDescription>
                {!token
                  ? "Sign in to apply for this position"
                  : hasAlreadyApplied
                  ? "You have already applied for this position"
                  : isExpired
                  ? "This job posting has expired"
                  : "Submit your application for this position"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!token ? (
                <div className="text-center py-4">
                  <p className="mb-4 text-muted-foreground">
                    Sign in to your account to apply for this job
                  </p>
                  <Button
                    onClick={() =>
                      navigate("/auth/login", {
                        state: { returnUrl: `/jobs/${id}` },
                      })
                    }
                  >
                    Sign In
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      to="/auth/register"
                      className="text-primary hover:underline"
                    >
                      Register
                    </Link>
                  </p>
                </div>
              ) : hasAlreadyApplied ? (
                <div className="bg-muted rounded-md p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    You have already applied for this position
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard/applications")}
                    className="w-full"
                  >
                    View Your Applications
                  </Button>
                </div>
              ) : isExpired ? (
                <div className="bg-muted rounded-md p-4 text-center">
                  <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="font-medium">Job Posting Expired</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    This job is no longer accepting applications
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/jobs")}
                    className="w-full"
                  >
                    Browse Other Jobs
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cover-letter"
                        className="block text-sm font-medium mb-1"
                      >
                        Cover Letter{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </label>
                      <Textarea
                        id="cover-letter"
                        placeholder="Briefly explain why you're a good fit for this role..."
                        className="min-h-32"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your profile information and resume will be included
                        automatically.
                      </p>
                    </div>

                    {applyError && (
                      <Alert variant="destructive" className="text-sm">
                        <AlertDescription>{applyError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            {token && !hasAlreadyApplied && !isExpired && (
              <>
                <Separator />
                <CardFooter className="flex justify-between py-4">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={applyMutation.isPending}
                    onClick={handleApply}
                  >
                    {applyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Job Type
                </h3>
                <p>{job.job_type}</p>
              </div>

              {job.salary_range && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Salary Range
                  </h3>
                  <p>{job.salary_range}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Location
                </h3>
                <p>{job.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Company
                </h3>
                <p>{job.company.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Posted On
                </h3>
                <p>{new Date(job.posted_at).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Closing Date
                </h3>
                <p className={isExpired ? "text-destructive" : ""}>
                  {new Date(job.expires_at).toLocaleDateString()}
                  {isExpired && " (Expired)"}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isExpired}
                onClick={() => {
                  document
                    .getElementById("apply-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                {hasAlreadyApplied ? "View Your Application" : "Apply Now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
