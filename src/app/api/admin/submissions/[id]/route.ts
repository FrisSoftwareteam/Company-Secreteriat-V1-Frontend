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
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submission = await db.submission.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const survey = findSurveyBySlug(submission.surveySlug);
  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  return NextResponse.json({
    survey,
    submission: {
      id: submission.id,
      createdAt: submission.createdAt.toISOString(),
      surveySlug: survey.slug,
      user: submission.user ? { email: submission.user.email } : null,
      data: submission.data,
    },
  });
}
