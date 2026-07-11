import { DemoPage } from "@/components/product-views";
import { getMarketingUser } from "@/lib/auth/session";

export default async function Page() {
  const user = await getMarketingUser();

  return <DemoPage user={user} />;
}
