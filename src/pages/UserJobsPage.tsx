import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicJobs } from "@/http/api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  Clock,
  ArrowRight,
  CalendarDays,
  Loader2,
} from "lucide-react";

interface JobFilters {
  query: string;
  location: string;
  jobType: string;
  sortBy: string;
}

const UserJobsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<JobFilters>({
    query: queryParams.get("q") || "",
    location: queryParams.get("location") || "",
    jobType: queryParams.get("type") || "",
    sortBy: queryParams.get("sort") || "latest",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Fetch all jobs with applied filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-jobs", debouncedFilters],
    queryFn: () => getPublicJobs(debouncedFilters),
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);

      // Update URL with filters
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      if (filters.location) params.set("location", filters.location);
      if (filters.jobType) params.set("type", filters.jobType);
      if (filters.sortBy !== "latest") params.set("sort", filters.sortBy);

      const newUrl = `${location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    }, 500);

    return () => clearTimeout(handler);
  }, [filters, location.pathname]);

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Generate job type options
  const jobTypes = [
    "FULL-TIME",
    "PART-TIME",
    "CONTRACT",
    "REMOTE",
    "INTERNSHIP",
  ];

  // Generate sorting options
  const sortOptions = [
    { value: "latest", label: "Most Recent" },
    { value: "oldest", label: "Oldest First" },
    { value: "title_asc", label: "Title (A-Z)" },
    { value: "title_desc", label: "Title (Z-A)" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-start gap-6">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Job</h1>
          <p className="text-muted-foreground">
            Browse through available positions and find the perfect match for
            your skills.
          </p>
        </div>

        {/* Search and filters */}
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job titles, skills, or keywords"
                    className="pl-10"
                    value={filters.query}
                    onChange={(e) =>
                      handleFilterChange("query", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    className="pl-10"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  className="appearance-none bg-background border border-input rounded-md h-10 px-3 text-sm"
                  value={filters.jobType}
                  onChange={(e) =>
                    handleFilterChange("jobType", e.target.value)
                  }
                >
                  <option value="">All Job Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("-", " ")}
                    </option>
                  ))}
                </select>

                <select
                  className="appearance-none bg-background border border-input rounded-md h-10 px-3 text-sm"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs listing */}
        <div className="w-full grid gap-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-red-500 mb-4">
                  Error loading jobs. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : data?.data?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">
                  No jobs found matching your criteria.
                </p>
                <Button
                  onClick={() =>
                    setFilters({
                      query: "",
                      location: "",
                      jobType: "",
                      sortBy: "latest",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {data?.data?.length || 0} jobs
              </p>

              {data?.data?.map((job) => (
                <Card
                  key={job.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold hover:text-primary transition-colors">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building2 className="h-3.5 w-3.5 mr-1.5" />
                          {job.company.name}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          new Date(job.expires_at) < new Date()
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {new Date(job.expires_at) < new Date()
                          ? "Expired"
                          : job.job_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground mb-4">
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
                    </div>

                    <p className="text-sm line-clamp-2">{job.description}</p>

                    {job.required_skills && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          Required Skills:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {typeof job.required_skills === "string"
                            ? job.required_skills.split(",").map((skill, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill.trim()}
                                </Badge>
                              ))
                            : job.required_skills.map((skill, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between py-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(job.expires_at) < new Date()
                          ? "Expired"
                          : `Closes ${new Date(
                              job.expires_at
                            ).toLocaleDateString()}`}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      disabled={new Date(job.expires_at) < new Date()}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserJobsPage;
