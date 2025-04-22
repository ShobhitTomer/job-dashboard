import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
} from "@/http/api";
import useTokenStore from "@/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  FileText,
  Github,
  Globe,
  Loader2,
  Linkedin,
  MapPin,
  PencilLine,
  User,
  Upload,
  X,
} from "lucide-react";

// Define the form schema
const profileFormSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  linkedin_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  github_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  portfolio_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  skills: z.string().optional(),
  experience: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserProfilePage = () => {
  const { user } = useTokenStore((state) => state);
  const queryClient = useQueryClient();
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user?.id,
  });

  // Form to update profile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      bio: "",
      location: "",
      phone: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
      skills: "",
      experience: "",
    },
    mode: "onChange",
  });

  // Update form values when profile data is loaded
  useEffect(() => {
    if (profileData?.data && user) {
      form.reset({
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        bio: profileData.data.bio || "",
        location: profileData.data.location || "",
        phone: user.phone || "",
        linkedin_url: profileData.data.linkedin_url || "",
        github_url: profileData.data.github_url || "",
        portfolio_url: profileData.data.portfolio_url || "",
        skills: profileData.data.skills || "",
        experience: profileData.data.experience || "",
      });
    }
  }, [profileData, user, form]);

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => updateUserProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setSaveMessage({
        type: "success",
        message: "Profile updated successfully!",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    },
    onError: (error: any) => {
      setSaveMessage({
        type: "error",
        message: `Error updating profile: ${error.message || "Unknown error"}`,
      });
    },
  });

  // Mutation to update profile picture
  const updatePictureMutation = useMutation({
    mutationFn: (file: File) => updateProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setIsEditingPhoto(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSaveMessage({
        type: "success",
        message: "Profile picture updated successfully!",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    },
    onError: (error: any) => {
      setSaveMessage({
        type: "error",
        message: `Error updating profile picture: ${
          error.message || "Unknown error"
        }`,
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  function onSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate(values);
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.user_metadata?.first_name || "";
    const lastName = user.user_metadata?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Get formatted skills array
  const formatSkills = (skills: string) => {
    if (!skills) return [];
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-muted-foreground mb-6">
        Manage your personal information and profile details
      </p>

      {saveMessage && (
        <Alert
          variant={saveMessage.type === "success" ? "default" : "destructive"}
          className={
            saveMessage.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 mb-6"
              : "mb-6"
          }
        >
          <AlertDescription>{saveMessage.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar with profile photo and quick info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {isEditingPhoto ? (
                    <div className="mb-4 relative">
                      <Avatar className="h-32 w-32">
                        {previewUrl ? (
                          <AvatarImage src={previewUrl} alt="Profile Preview" />
                        ) : (
                          <>
                            <AvatarImage
                              src={profileData?.data?.profile_picture}
                              alt={getUserInitials()}
                            />
                            <AvatarFallback className="text-2xl">
                              {getUserInitials()}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="relative mb-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage
                          src={profileData?.data?.profile_picture}
                          alt={getUserInitials()}
                        />
                        <AvatarFallback className="text-2xl">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                        onClick={() => setIsEditingPhoto(true)}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {isEditingPhoto && (
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingPhoto(false);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (selectedFile) {
                            updatePictureMutation.mutate(selectedFile);
                          }
                        }}
                        disabled={
                          !selectedFile || updatePictureMutation.isPending
                        }
                      >
                        {updatePictureMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}

                  <h2 className="text-xl font-semibold">
                    {user?.user_metadata?.first_name}{" "}
                    {user?.user_metadata?.last_name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {user?.email}
                  </p>

                  {profileData?.data?.location && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profileData.data.location}
                    </div>
                  )}
                </div>
              </div>

              {profileData?.data?.skills && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {formatSkills(profileData.data.skills).map(
                      (skill, index) => (
                        <div
                          key={index}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                        >
                          {skill}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                {profileData?.data?.linkedin_url && (
                  <a
                    href={profileData.data.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn Profile
                  </a>
                )}

                {profileData?.data?.github_url && (
                  <a
                    href={profileData.data.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm hover:text-primary transition-colors"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub Profile
                  </a>
                )}

                {profileData?.data?.portfolio_url && (
                  <a
                    href={profileData.data.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Portfolio Website
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area with tabs */}
        <div className="lg:col-span-3">
          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile Info</TabsTrigger>
              <TabsTrigger value="resume">Resume & Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal information and contact details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 123-4567"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="New York, NY" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your general location, like city and state/country
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                      <CardDescription>
                        Add your bio, skills, and experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell employers about yourself..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief introduction about yourself and your
                              career goals
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="React, JavaScript, Node.js, UI/UX Design"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your skills separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Experience</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your relevant work experience..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Highlight your work history, roles, and
                              achievements
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Online Profiles</CardTitle>
                      <CardDescription>
                        Add links to your professional profiles and portfolio
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="linkedin_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn Profile</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://linkedin.com/in/yourprofile"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="github_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub Profile</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://github.com/yourusername"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="portfolio_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portfolio Website</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://yourportfolio.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          updateProfileMutation.isPending ||
                          !form.formState.isDirty
                        }
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>Save Changes</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="resume">
              <Card>
                <CardHeader>
                  <CardTitle>Resume & Documents</CardTitle>
                  <CardDescription>
                    Upload your resume and other relevant documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium mb-2">
                        Your Resume
                      </h3>

                      {profileData?.data?.resume ? (
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-8 w-8 mr-3 text-primary" />
                              <div>
                                <p className="font-medium">Your Resume</p>
                                <p className="text-sm text-muted-foreground">
                                  Last updated:{" "}
                                  {new Date(
                                    profileData.data.updated_at || Date.now()
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={profileData.data.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  // Handle resume deletion
                                  console.log("Delete resume");
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <h3 className="font-medium mb-1">
                            No resume uploaded yet
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload your resume to apply for jobs more quickly
                          </p>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Resume
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-base font-medium mb-2">
                        Cover Letter Template (Optional)
                      </h3>

                      {profileData?.data?.cover_letter_template ? (
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-8 w-8 mr-3 text-primary" />
                              <div>
                                <p className="font-medium">
                                  Cover Letter Template
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Last updated:{" "}
                                  {new Date(
                                    profileData.data.updated_at || Date.now()
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Handle viewing cover letter template
                                  console.log("View cover letter template");
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  // Handle cover letter template deletion
                                  console.log("Delete cover letter template");
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <h3 className="font-medium mb-1">
                            No cover letter template added
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create a template to use when applying for jobs
                          </p>
                          <Button>
                            <PencilLine className="h-4 w-4 mr-2" />
                            Create Template
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-base font-medium mb-2">
                        Additional Documents
                      </h3>

                      {profileData?.data?.additional_documents &&
                      profileData.data.additional_documents.length > 0 ? (
                        <div className="space-y-3">
                          {profileData.data.additional_documents.map(
                            (doc: any, index: number) => (
                              <div
                                key={index}
                                className="bg-muted/30 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FileText className="h-8 w-8 mr-3 text-primary" />
                                    <div>
                                      <p className="font-medium">{doc.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Uploaded:{" "}
                                        {new Date(
                                          doc.uploaded_at
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        View
                                      </a>
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        // Handle document deletion
                                        console.log(
                                          `Delete document ${doc.id}`
                                        );
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                          <Button variant="outline" className="mt-4">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Another Document
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <h3 className="font-medium mb-1">
                            No additional documents
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload certificates, portfolios, or other relevant
                            documents
                          </p>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Supported file formats: PDF, DOC, DOCX (Max size: 5MB)
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
