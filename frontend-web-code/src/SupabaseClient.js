import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = "https://ztagrfwdunxdrnvledax.supabase.co";
const supabaseAnonKey = "sb_publishable_IjvDDDK4jlzu6sKnGFLauQ_nWQHFCTn";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
	},
});

// Helper function to log errors for debugging
export const logSupabaseError = (operation, error) => {
	console.error(`[Supabase Error] ${operation}:`, {
		message: error?.message,
		details: error?.details,
		hint: error?.hint,
		code: error?.code,
	});
};

