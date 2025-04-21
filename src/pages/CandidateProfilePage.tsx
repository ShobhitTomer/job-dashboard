import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/http/api";
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
  User,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  PanelRight,
  DownloadCloud,
  Link as LinkIcon,
} from "lucide-react";

const CandidateProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["candidate-profile", id],
    queryFn: () => getUserProfile(id!),
    enabled: !!id,
  });

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
              Error loading candidate profile
            </h3>
            <p className="text-muted-foreground mt-2">
              {error instanceof Error
                ? error.message
                : "Candidate not found or an error occurred."}
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

  const profile = data.data;
  const userFullName =
    profile.user?.first_name && profile.user?.last_name
      ? `${profile.user.first_name} ${profile.user.last_name}`
      : "Candidate";
  const initials =
    profile.user?.first_name && profile.user?.last_name
      ? `${profile.user.first_name.charAt(0)}${profile.user.last_name.charAt(
          0
        )}`
      : "C";

  // Parse skills and education as arrays if they're strings
  const skills =
    typeof profile.skills === "string"
      ? profile.skills.split(",").map((s) => s.trim())
      : Array.isArray(profile.skills)
      ? profile.skills
      : [];

  const education =
    typeof profile.education === "string"
      ? profile.education.split(",").map((e) => e.trim())
      : Array.isArray(profile.education)
      ? profile.education
      : [];

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
              <BreadcrumbPage>{userFullName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-12">
        {/* Sidebar with profile details */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile.profile_picture} alt={userFullName} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{userFullName}</CardTitle>
              <CardDescription>
                {profile.location && (
                  <div className="flex items-center justify-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Contact information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Contact Information</h3>

                  {profile.user?.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={`mailto:${profile.user.email}`}
                        className="text-primary hover:underline"
                      >
                        {profile.user.email}
                      </a>
                    </div>
                  )}

                  {profile.user?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={`tel:${profile.user.phone}`}
                        className="text-primary hover:underline"
                      >
                        {profile.user.phone}
                      </a>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Social links */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Social & Portfolio</h3>

                  {profile.linkedin_url && (
                    <div className="flex items-center text-sm">
                      <Linkedin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline line-clamp-1"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  {profile.portfolio_url && (
                    <div className="flex items-center text-sm">
                      <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline line-clamp-1"
                      >
                        Portfolio
                      </a>
                    </div>
                  )}

                  {profile.github_url && (
                    <div className="flex items-center text-sm">
                      <Github className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline line-clamp-1"
                      >
                        GitHub Profile
                      </a>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Skills summary */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Key Skills</h3>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 8).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {skills.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{skills.length - 8} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skills listed
                    </p>
                  )}
                </div>

                {/* Documents/Resume */}
                {profile.resume && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Documents</h3>
                      <div className="flex items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          asChild
                        >
                          <a
                            href={profile.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Resume
                          </a>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Profile</CardTitle>
              <CardDescription>
                Detailed information about {userFullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="about">
                <TabsList className="mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-4">
                  {profile.bio ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Bio</h3>
                      <p className="text-sm whitespace-pre-line">
                        {profile.bio}
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No bio information available</p>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="experience">
                  {profile.experience ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mb-2">
                        Work Experience
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-line">
                          {profile.experience}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No experience information available</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="education">
                  {education.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mb-2">Education</h3>
                      <div className="space-y-3">
                        {education.map((edu, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <p>{edu}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <PanelRight className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No education information available</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="applications">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">
                      Job Applications
                    </h3>

                    {/* This would need to be fetched from the API, showing a placeholder for now */}
                    <p className="text-muted-foreground text-sm mb-4">
                      Showing all job applications submitted by this candidate.
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        navigate(`/dashboard/applications?userId=${id}`)
                      }
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View All Applications
                    </Button>
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

export default CandidateProfilePage;
