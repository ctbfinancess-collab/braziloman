import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier } from "@/lib/loyalty";
import { getDocumentSignedUrl } from "@/lib/media";
import type { DocumentEntry } from "@/lib/candidateSchemas";
import { DashboardDocuments } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Documentos",
  robots: { index: false, follow: false },
};

export default async function DashboardDocumentsPage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);

  const raw = ((member.documents as DocumentEntry[] | null) ?? []) as DocumentEntry[];
  const documents = await Promise.all(
    raw.map(async (doc) => ({
      key: doc.key,
      label: doc.label,
      fileName: doc.fileName,
      url: doc.storageKey ? await getDocumentSignedUrl(doc.storageKey).catch(() => "") : "",
    }))
  );

  return (
    <DashboardDocuments
      member={{
        name: member.name,
        email: member.email,
        company: member.company,
        role: member.role,
        sector: member.sector,
        country: member.country,
        phone: member.phone,
        createdAt: member.createdAt,
      }}
      tier={tier}
      documents={documents}
    />
  );
}
