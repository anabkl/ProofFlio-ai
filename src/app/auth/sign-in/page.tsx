import { AuthForm } from "@/components/auth/auth-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="sign-in" next={params.next ?? "/onboarding"} />;
}
