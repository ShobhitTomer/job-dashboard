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

    // Check if user is an admin from user metadata
    const isAdmin = authData.user?.user_metadata?.is_admin === true;

    // If admin login is required but user is not an admin
    if (!isAdmin) {
      // Optional: Throw error if you want to prevent regular users from using admin dashboard
      throw new Error("You do not have admin privileges");
    }

    return {
      data: {
        accessToken: authData.session.access_token,
        user: {
          ...authData.user,
          isAdmin,
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
  isAdmin?: boolean; // Optional, default to false
}) => {
  try {
    // Register user in Supabase Auth with admin flag in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          is_admin: data.isAdmin || false, // Set admin status in metadata
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

    // No need to update role separately, it's already in user metadata

    return {
      data: {
        accessToken: authData.session?.access_token,
        user: authData.user,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Job API functions
export const getJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
            *,
            company:company_id(name)
        `
    )
    .order("created_at", { ascending: false });

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
  const { data, error } = await supabase
    .from("jobs")
    .insert([
      {
        ...jobData,
        posted_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return { data };
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
