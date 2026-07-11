import { LandingPage } from "@/components/product-views";
import { getMarketingUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getMarketingUser();

  return <LandingPage user={user} />;
}
