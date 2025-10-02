import { useEffect} from "react";
import { useRouter } from "expo-router";
import { Hero} from "../../src/components/Hero.jsx";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/login"), 3500);
    return () => clearTimeout(t);
  },[router]);

  return <Hero />;
}