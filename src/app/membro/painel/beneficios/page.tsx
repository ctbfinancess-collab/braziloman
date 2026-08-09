import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier } from "@/lib/loyalty";
import { memberCanAccessBenefit, type BenefitEligibility } from "@/lib/benefits";
import { MemberBenefits } from "@/components/MemberBenefits";

export const metadata: Metadata = {
  title: "Benefícios do Associado",
  robots: { index: false, follow: false },
};

export default async function DashboardBenefitsPage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);

  const rows = prisma
    ? await prisma.benefit.findMany({
        where: {
          status: "active",
          partner: { status: "active" },
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        include: { partner: { include: { category: true } } },
      })
    : [];

  const benefits = rows.map((b) => ({
    id: b.id,
    title: b.title,
    type: b.type,
    description: b.description,
    rules: b.rules,
    validFrom: b.validFrom ? b.validFrom.toISOString() : null,
    validUntil: b.validUntil ? b.validUntil.toISOString() : null,
    couponCode: b.couponCode,
    redeemUrl: b.redeemUrl,
    eligibility: b.eligibility as BenefitEligibility,
    featured: b.featured,
    createdAt: b.createdAt.toISOString(),
    eligible: memberCanAccessBenefit(tier, b.eligibility as BenefitEligibility),
    partner: {
      id: b.partner.id,
      name: b.partner.name,
      logoUrl: b.partner.logoUrl,
      category: b.partner.category.name,
      country: b.partner.country,
      city: b.partner.city,
    },
  }));

  return (
    <Suspense>
      <MemberBenefits
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
        benefits={benefits}
      />
    </Suspense>
  );
}
