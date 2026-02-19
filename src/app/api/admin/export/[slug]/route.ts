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

function toCsvCell(value: unknown) {
  if (value == null) return "";
  const raw =
    Array.isArray(value)
      ? value.join("; ")
      : typeof value === "string"
        ? value
        : JSON.stringify(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

function getAnswerMap(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {} as Record<string, unknown>;
  }
  const record = data as Record<string, unknown>;
  if (record.answers && typeof record.answers === "object" && !Array.isArray(record.answers)) {
    return record.answers as Record<string, unknown>;
  }
  return record;
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

  const filtered = submissions.filter(
    (submission) => normalizeSlug(submission.surveySlug) === normalized
  );

  const questionKeys = survey.sections.flatMap((section) =>
    section.questions.map((question) => question.key)
  );

  const header = ["submission_id", "submitted_at", "user_email", ...questionKeys];
  const rows = filtered.map((submission) => {
    const answerMap = getAnswerMap(submission.data);
    const row = [
      submission.id,
      submission.createdAt.toISOString(),
      submission.user?.email ?? "",
      ...questionKeys.map((key) => answerMap[key]),
    ];
    return row.map(toCsvCell).join(",");
  });

  const csv = [header.map(toCsvCell).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${survey.slug}-submissions.csv`,
      "Cache-Control": "no-store",
    },
  });
}
