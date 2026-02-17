import { NextRequest, NextResponse } from "next/server";
import { getApiSessionUser } from "@/lib/api-session";
import { db } from "@/lib/db";
import { surveys } from "@/lib/surveys";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function canonicalSurveySlug(rawSlug: string) {
  const normalized = normalizeSlug(rawSlug);
  const match = surveys.find((survey) => normalizeSlug(survey.slug) === normalized);
  return match?.slug ?? rawSlug;
}

export async function GET(request: NextRequest) {
  const user = await getApiSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const filteredSurveys = q
    ? surveys.filter(
        (survey) =>
          survey.title.toLowerCase().includes(q) || survey.description.toLowerCase().includes(q)
      )
    : surveys;

  const submissions = await db.submission.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const filteredSubmissions = q
    ? submissions.filter((submission) => {
        const slug = canonicalSurveySlug(submission.surveySlug).toLowerCase();
        const email = submission.user?.email?.toLowerCase() ?? "";
        return slug.includes(q) || email.includes(q) || submission.id.toLowerCase().includes(q);
      })
    : submissions;

  const grouped = await db.submission.groupBy({
    by: ["surveySlug"],
    _count: { _all: true },
  });

  const countsBySurveySlug = grouped.reduce<Record<string, number>>((acc, item) => {
    const canonical = canonicalSurveySlug(item.surveySlug);
    acc[canonical] = (acc[canonical] ?? 0) + item._count._all;
    return acc;
  }, {});

  return NextResponse.json({
    surveys: filteredSurveys,
    recentSubmissions: filteredSubmissions.map((submission) => ({
      id: submission.id,
      surveySlug: canonicalSurveySlug(submission.surveySlug),
      createdAt: submission.createdAt.toISOString(),
      user: submission.user ? { email: submission.user.email } : null,
    })),
    countsBySurveySlug,
  });
}
