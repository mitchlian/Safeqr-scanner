import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zbfbpswmaylqjapqwbel.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZmJwc3dtYXlscWphcHF3YmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Nzg2NDAsImV4cCI6MjA5NjU1NDY0MH0.7rfeACUMZ8XVozaBzH-qJGRKyKXcX5XDaXi4NQXxF0A";

export const supabase = createClient(supabaseUrl, supabaseKey);