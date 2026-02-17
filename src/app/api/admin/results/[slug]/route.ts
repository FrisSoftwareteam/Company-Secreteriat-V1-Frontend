import { NextRequest, NextResponse } from "next/server";
import { getApiSessionUser } from "@/lib/api-session";
import { db } from "@/lib/db";
import { surveys } from "@/lib/surveys";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findSurveyBySlug(rawSlug: string) {
  const normalized = normalizeSlug(rawSlug);
  return surveys.find((survey) => normalizeSlug(survey.slug) === normalized) ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getApiSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const survey = findSurveyBySlug(slug);
  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const normalized = normalizeSlug(survey.slug);
  const submissions = await db.submission.findMany({
    where: {
      surveySlug: {
        in: [slug, survey.slug, slug.replace(/-/g, "_"), slug.replace(/_/g, "-")],
      },
    },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const normalizedSubmissions = submissions.filter(
    (submission) => normalizeSlug(submission.surveySlug) === normalized
  );

  return NextResponse.json({
    survey,
    submissions: normalizedSubmissions.map((submission) => ({
      id: submission.id,
      createdAt: submission.createdAt.toISOString(),
      surveySlug: survey.slug,
      user: submission.user ? { email: submission.user.email } : null,
      data: submission.data,
    })),
  });
}
