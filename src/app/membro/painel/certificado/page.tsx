import type { Metadata } from "next";
import QRCode from "qrcode";
import { requireActiveMember } from "@/lib/memberDashboard";
import { SITE_URL } from "@/lib/email";
import { getTier } from "@/lib/loyalty";
import { DashboardCertificate } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Meu Certificado",
  robots: { index: false, follow: false },
};

export default async function DashboardCertificatePage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);
  const qrDataUrl = member.memberNumber
    ? await QRCode.toDataURL(`${SITE_URL}/membro/verificar/${member.memberNumber}`, { margin: 1, width: 240 })
    : null;

  return (
    <DashboardCertificate
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
      memberNumber={member.memberNumber!}
      memberSince={member.memberSince}
      qrDataUrl={qrDataUrl}
    />
  );
}
