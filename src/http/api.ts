import { createClient } from "@supabase/supabase-js";
import useTokenStore from "@/store";

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure both values are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth API functions
export const login = async (data: { email: string; password: string }) => {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) throw authError;

    // Get user details including role from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user role:", userError);
      // Continue with default role instead of throwing
    }

    // Set role from database, default to 'user' if not found
    const role = userData?.role || "user";

    return {
      data: {
        accessToken: authData.session.access_token,
        user: {
          ...authData.user,
          role: role,
        },
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) => {
  try {
    // Register user in Supabase Auth with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
        },
      },
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User creation failed");
    }

    // The trigger function will handle creating the user in the public.users table
    // with the 'user' role automatically after auth.users is updated

    return {
      data: {
        accessToken: authData.session?.access_token,
        user: {
          ...authData.user,
          role: "user", // Always set initial role to 'user'
        },
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Get the current user with role information
export const getCurrentUser = async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!authData.user) {
      return { data: null };
    }

    // Get user role from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user role:", userError);
    }

    // Set role from database, default to 'user' if not found
    const role = userData?.role || "user";

    return {
      data: {
        ...authData.user,
        role: role,
      },
    };
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

// Job API functions
export const getJobs = async (companyId?: string) => {
  let query = supabase
    .from("jobs")
    .select(
      `
            *,
            company:company_id(name, user_id)
        `
    )
    .order("created_at", { ascending: false });

  // If company ID is provided, filter jobs by company
  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return { data };
};

export const getJobById = async (id: string) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
            *,
            company:company_id(*)
        `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return { data };
};

export const createJob = async (jobData: {
  title: string;
  company_id: string;
  location: string;
  description: string;
  salary_range: string;
  job_type: string;
  required_skills: string;
  expires_at: string;
}) => {
  try {
    // Convert comma-separated skills to array
    const skills = jobData.required_skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          ...jobData,
          required_skills: skills, // Use the parsed array
          posted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const updateJob = async (
  id: string,
  jobData: {
    title?: string;
    company_id?: string;
    location?: string;
    description?: string;
    salary_range?: string;
    job_type?: string;
    required_skills?: string;
    expires_at?: string;
  }
) => {
  const { data, error } = await supabase
    .from("jobs")
    .update(jobData)
    .eq("id", id)
    .select();

  if (error) throw error;
  return { data };
};

export const deleteJob = async (id: string) => {
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) throw error;
  return { success: true };
};

// Applications API
export const getApplications = async (jobId?: string) => {
  let query = supabase.from("applications").select(`
            *,
            job:job_id(*),
            user:user_id(
                id,
                first_name,
                last_name,
                email,
                phone,
                profile:profiles(*)
            )
        `);

  if (jobId) {
    query = query.eq("job_id", jobId);
  }

  const { data, error } = await query.order("applied_at", { ascending: false });

  if (error) throw error;
  return { data };
};

export const getApplicationById = async (id: string) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
            *,
            job:job_id(*),
            user:user_id(
                id,
                first_name,
                last_name,
                email,
                phone,
                profile:profiles(*)
            )
        `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return { data };
};

export const updateApplicationStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) throw error;
  return { data };
};

// Companies API
export const getCompanies = async () => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  if (error) throw error;
  return { data };
};

export const getCompanyByUserId = async (userId: string) => {
  if (!userId) {
    return { data: null };
  }

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .single();

  // If no company found, return null rather than error
  if (error && error.code === "PGRST116") {
    return { data: null };
  }

  if (error) {
    console.error("Error fetching company:", error);
    throw error;
  }

  return { data };
};

export const createCompany = async (companyData: {
  name: string;
  industry: string;
  headquarters: string;
  user_id: string;
}) => {
  // Check if company already exists for this user
  const { data: existingCompany, error: checkError } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", companyData.user_id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw checkError;
  }

  let response;

  if (existingCompany) {
    // Update existing company
    const { data, error } = await supabase
      .from("companies")
      .update({
        ...companyData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingCompany.id)
      .select();

    if (error) throw error;
    response = { data };
  } else {
    // Create new company
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          ...companyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    response = { data };
  }

  return response;
};

// User Profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return { data };
};

// Get notifications for admin
export const getNotifications = async () => {
  const { data: adminUser } = await supabase.auth.getUser();

  if (!adminUser.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", adminUser.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return { data };
};

// Get all public jobs (for job browsing)
export const getPublicJobs = async (filters?: {
  query?: string;
  location?: string;
  jobType?: string;
  sortBy?: string;
}) => {
  let query = supabase
    .from("jobs")
    .select(
      `
      *,
      company:company_id(name, about)
      `
    );

  // Apply text search filter
  if (filters?.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,required_skills.ilike.%${filters.query}%`);
  }

  // Apply location filter
  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  // Apply job type filter
  if (filters?.jobType) {
    query = query.eq("job_type", filters.jobType);
  }

  // Apply sorting
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case "latest":
        query = query.order("posted_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("posted_at", { ascending: true });
        break;
      case "title_asc":
        query = query.order("title", { ascending: true });
        break;
      case "title_desc":
        query = query.order("title", { ascending: false });
        break;
      default:
        query = query.order("posted_at", { ascending: false });
    }
  } else {
    // Default sort by most recent
    query = query.order("posted_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return { data };
};

// Check if user has already applied for a job
export const checkApplicationExists = async (jobId: string, userId?: string) => {
  if (!userId) {
    return { data: { exists: false } };
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return { data: { exists: !!data } };
};

// Apply for a job
export const applyForJob = async (
  jobId: string,
  applicationData: {
    cover_letter?: string;
  }
) => {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user?.id) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        job_id: jobId,
        user_id: userData.user.id,
        status: "pending",
        cover_letter: applicationData.cover_letter || null,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select(
      `
      *,
      job:job_id(title, company:company_id(name))
      `
    );

  if (error) {
    // Check if error is due to unique constraint (already applied)
    if (error.code === "23505") {
      throw new Error("You have already applied for this job");
    }
    throw error;
  }

  return { data };
};

// Get user's applications
export const getUserApplications = async () => {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user?.id) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job:job_id(
        id,
        title,
        location,
        job_type,
        company:company_id(name)
      )
      `
    )
    .eq("user_id", userData.user.id)
    .order("applied_at", { ascending: false });

  if (error) throw error;
  return { data };
};

// Get a specific application by ID (for the logged-in user)
export const getUserApplicationById = async (id: string) => {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user?.id) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job:job_id(
        id,
        title,
        company_id,
        location,
        job_type,
        description,
        salary_range,
        posted_at,
        expires_at,
        required_skills,
        company:company_id(
          id,
          name,
          about
        )
      )
      `
    )
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (error) throw error;
  return { data };
};

// Update user profile
export const updateUserProfile = async (profileData: {
  first_name: string;
  last_name: string;
  bio?: string;
  location?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: string;
  experience?: string;
}) => {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user?.id) {
    throw new Error("User not authenticated");
  }

  // First, update user metadata (name)
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
    },
  });

  if (authError) throw authError;

  // Update phone if provided
  if (profileData.phone) {
    const { error: phoneError } = await supabase.auth.updateUser({
      phone: profileData.phone,
    });

    if (phoneError) throw phoneError;
  }

  // Check if profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (checkError && checkError.code !== "PGRST116") {
    throw checkError;
  }

  // Prepare profile data
  const profile = {
    user_id: userData.user.id,
    bio: profileData.bio || null,
    location: profileData.location || null,
    linkedin_url: profileData.linkedin_url || null,
    github_url: profileData.github_url || null,
    portfolio_url: profileData.portfolio_url || null,
    skills: profileData.skills || null,
    experience: profileData.experience || null,
    updated_at: new Date().toISOString(),
  };

  let result;

  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", userData.user.id)
      .select();

    if (error) throw error;
    result = { data };
  } else {
    // Create new profile
    profile.created_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("profiles")
      .insert([profile])
      .select();

    if (error) throw error;
    result = { data };
  }

  return result;
};

// Update profile picture
export const updateProfilePicture = async (file: File) => {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user?.id) {
    throw new Error("User not authenticated");
  }

  // Upload the file to storage
  const fileName = `${userData.user.id}-${Date.now()}-profile-picture`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("profile-pictures")
    .upload(fileName, file, {
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from("profile-pictures")
    .getPublicUrl(fileName);

  if (!publicUrlData.publicUrl) {
    throw new Error("Failed to get public URL");
  }

  // Update profile with the new picture URL
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .update({
      profile_picture: publicUrlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userData.user.id)
    .select();

  if (profileError) throw profileError;

  return { data: profileData };
};

// Upload resume
export const uploadResume = async (file: File) => {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user?.id) {
    throw new Error("User not authenticated");
  }

  // Upload the file to storage
  const fileName = `${userData.user.id}-${Date.now()}-resume`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(fileName, file, {
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from("resumes")
    .getPublicUrl(fileName);

  if (!publicUrlData.publicUrl) {
    throw new Error("Failed to get public URL");
  }

  // Update profile with the new resume URL
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .update({
      resume: publicUrlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userData.user.id)
    .select();

  if (profileError) throw profileError;

  return { data: profileData };
};

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  const { setToken } = useTokenStore.getState();

  if (event === "SIGNED_IN" && session) {
    setToken(session.access_token);
  } else if (event === "SIGNED_OUT") {
    setToken("");
  }
});

// Export supabase client for direct use if needed
export { supabase };
