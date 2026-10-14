import { ProductPage } from "../../../components/product/server-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let issueId: string;
  try { issueId = decodeURIComponent(id); }
  catch { issueId = ""; }
  return <ProductPage view="detail" issueId={issueId} />;
}
