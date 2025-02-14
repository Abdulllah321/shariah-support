"use client"
import { useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter()
  // Redirects immediately on the server side.
  router.replace("/daily-activity");
  return null; // This code is never reached.
}
