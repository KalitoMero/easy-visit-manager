
// Re-export the toast hook from the main hook file
// This resolves circular dependency issues
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
