import { TemplatesPage } from "@/components/product-views";
import { getMarketingUser } from "@/lib/auth/session";

export default async function Page() {
  const user = await getMarketingUser();

  return <TemplatesPage user={user} />;
}
