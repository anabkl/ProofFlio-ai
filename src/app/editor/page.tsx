import { PersistentEditorPage } from "@/components/editor/persistent-editor-page";
import { getEditorInitialState } from "@/lib/editor/server";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialState = await getEditorInitialState(await searchParams);
  return <PersistentEditorPage initialState={initialState} />;
}
