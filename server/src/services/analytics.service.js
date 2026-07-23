import prisma from "../config/prisma.js";

const TECHNICAL_KEYWORDS = [
    "technical",
    "algorithm",
    "data structure",
    "coding",
    "implementation",
    "database",
    "api",
    "backend",
    "system design",
    "architecture",
    "performance",
    "debugging",
    "testing",
    "complexity",
];

const COMMUNICATION_KEYWORDS = [
    "communication",
    "clarity",
    "clear",
    "concise",
    "articulate",
    "structured",
    "presentation",
    "collaboration",
    "confidence",
    "story",
    "explain",
];

const SKILL_RULES = [
    { key: "technical-depth", label: "Technical Depth", keywords: TECHNICAL_KEYWORDS },
    { key: "communication", label: "Communication", keywords: COMMUNICATION_KEYWORDS },
    { key: "problem-solving", label: "Problem Solving", keywords: ["problem solving", "reasoning", "approach", "logic", "analysis"] },
    { key: "system-design", label: "System Design", keywords: ["system design", "architecture", "tradeoff", "scalability", "distributed"] },
    { key: "debugging", label: "Debugging", keywords: ["debug", "bug", "troubleshoot", "diagnose", "root cause"] },
    { key: "confidence", label: "Confidence", keywords: ["confidence", "confident", "hesitation", "nervous", "calm"] },
    { key: "clarity", label: "Clarity", keywords: ["clarity", "clear", "concise", "structured", "organized"] },
    { key: "collaboration", label: "Collaboration", keywords: ["team", "collaboration", "stakeholder", "feedback", "pair"] },
];

const toArray = (value) => (Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []);

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const toDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const getWeekStart = (value) => {
    const date = new Date(value);
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = utcDate.getUTCDay();
    const offset = (day + 6) % 7;
    utcDate.setUTCDate(utcDate.getUTCDate() - offset);
    return utcDate;
};

const getWeekEnd = (weekStart) => {
    const end = new Date(weekStart);
    end.setUTCDate(end.getUTCDate() + 6);
    return end;
};

const getMonthStart = (value) => {
    const date = new Date(value);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

const formatDate = (value) => new Date(value).toISOString();

const countKeywordHits = (items, keywords) => {
    const normalizedItems = toArray(items).map(normalizeText);

    return normalizedItems.reduce((total, item) => {
        return total + (keywords.some((keyword) => item.includes(keyword)) ? 1 : 0);
    }, 0);
};

const classifyTopic = (value) => {
    const text = normalizeText(value) || "general";
    const match = SKILL_RULES.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));

    return match?.label || text.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const buildSessionMetrics = (session) => {
    const latestFeedback = session.feedbacks?.[0] || null;
    const strengths = toArray(latestFeedback?.strengths);
    const weaknesses = toArray(latestFeedback?.weaknesses);
    const score = Number(latestFeedback?.score || 0);
    const technicalBias = countKeywordHits(strengths, TECHNICAL_KEYWORDS) - countKeywordHits(weaknesses, TECHNICAL_KEYWORDS);
    const communicationBias = countKeywordHits(strengths, COMMUNICATION_KEYWORDS) - countKeywordHits(weaknesses, COMMUNICATION_KEYWORDS);

    const technicalScore = clamp(score + technicalBias * 5, 0, 100);
    const communicationScore = clamp(score + communicationBias * 5, 0, 100);
    const practiceSeconds = (session.recordings || []).reduce((total, recording) => total + (Number(recording.durationSeconds) || 0), 0);
    const activityDate = latestFeedback?.createdAt || session.createdAt;
    const topic = classifyTopic(latestFeedback?.currentTopic || session.currentTopic || session.role);

    return {
        id: session.id,
        createdAt: activityDate,
        topic,
        score,
        technicalScore,
        communicationScore,
        practiceHours: practiceSeconds / 3600,
        strengths,
        weaknesses,
        summary: latestFeedback?.conversationSummary || "",
        followUpQuestion: latestFeedback?.followUpQuestion || "",
        interviewType: session.interviewType,
        role: session.role,
        status: session.status,
    };
};

// The raw interview records are normalized once so every endpoint can reuse the same computed view.
const buildAnalyticsView = (sessions) => {
    const metrics = sessions.map(buildSessionMetrics);
    const totalInterviews = metrics.length;
    const averageScore = totalInterviews
        ? round(metrics.reduce((total, item) => total + item.score, 0) / totalInterviews)
        : 0;
    const averageTechnicalScore = totalInterviews
        ? round(metrics.reduce((total, item) => total + item.technicalScore, 0) / totalInterviews)
        : 0;
    const averageCommunicationScore = totalInterviews
        ? round(metrics.reduce((total, item) => total + item.communicationScore, 0) / totalInterviews)
        : 0;
    const hoursPracticed = round(metrics.reduce((total, item) => total + item.practiceHours, 0));
    const latestMetric = metrics[metrics.length - 1] || null;
    const latestFeedback = latestMetric?.summary || latestMetric?.followUpQuestion || null;

    const activityDays = [...new Set(metrics.map((item) => toDateKey(item.createdAt)))].sort((a, b) => b.localeCompare(a));
    const currentStreak = calculateStreak(activityDays);

    const skillTotals = new Map(SKILL_RULES.map((rule) => [rule.key, { label: rule.label, strengths: 0, weaknesses: 0, latestAt: null }]));
    const topicTotals = new Map();
    const weeklyTotals = new Map();
    const monthlyTotals = new Map();

    for (const metric of metrics) {
        const metricDate = new Date(metric.createdAt);
        const weekStart = getWeekStart(metricDate);
        const monthStart = getMonthStart(metricDate);
        const weekKey = weekStart.toISOString();
        const monthKey = monthStart.toISOString();
        const topicKey = metric.topic;
        const feedbackText = `${metric.topic} ${metric.summary} ${metric.followUpQuestion}`.toLowerCase();

        for (const rule of SKILL_RULES) {
            const skillBucket = skillTotals.get(rule.key);
            const strengthHits = countKeywordHits(metric.strengths, rule.keywords) + (rule.keywords.some((keyword) => feedbackText.includes(keyword)) ? 1 : 0);
            const weaknessHits = countKeywordHits(metric.weaknesses, rule.keywords) + (rule.keywords.some((keyword) => feedbackText.includes(keyword)) ? 1 : 0);

            skillBucket.strengths += strengthHits;
            skillBucket.weaknesses += weaknessHits;
            skillBucket.latestAt = metric.createdAt > (skillBucket.latestAt || metric.createdAt) ? metric.createdAt : skillBucket.latestAt;
        }

        if (!topicTotals.has(topicKey)) {
            topicTotals.set(topicKey, {
                topic: metric.topic,
                interviewCount: 0,
                scoreTotal: 0,
                technicalTotal: 0,
                communicationTotal: 0,
                lastPracticedAt: metric.createdAt,
            });
        }

        const topicBucket = topicTotals.get(topicKey);
        topicBucket.interviewCount += 1;
        topicBucket.scoreTotal += metric.score;
        topicBucket.technicalTotal += metric.technicalScore;
        topicBucket.communicationTotal += metric.communicationScore;
        topicBucket.lastPracticedAt = metric.createdAt > topicBucket.lastPracticedAt ? metric.createdAt : topicBucket.lastPracticedAt;

        if (!weeklyTotals.has(weekKey)) {
            weeklyTotals.set(weekKey, {
                weekStart,
                weekEnd: getWeekEnd(weekStart),
                interviewsCompleted: 0,
                scoreTotal: 0,
                technicalTotal: 0,
                communicationTotal: 0,
                practiceHours: 0,
            });
        }

        const weeklyBucket = weeklyTotals.get(weekKey);
        weeklyBucket.interviewsCompleted += 1;
        weeklyBucket.scoreTotal += metric.score;
        weeklyBucket.technicalTotal += metric.technicalScore;
        weeklyBucket.communicationTotal += metric.communicationScore;
        weeklyBucket.practiceHours += metric.practiceHours;

        if (!monthlyTotals.has(monthKey)) {
            monthlyTotals.set(monthKey, {
                monthStart,
                interviewsCompleted: 0,
                scoreTotal: 0,
                technicalTotal: 0,
                communicationTotal: 0,
                practiceHours: 0,
            });
        }

        const monthlyBucket = monthlyTotals.get(monthKey);
        monthlyBucket.interviewsCompleted += 1;
        monthlyBucket.scoreTotal += metric.score;
        monthlyBucket.technicalTotal += metric.technicalScore;
        monthlyBucket.communicationTotal += metric.communicationScore;
        monthlyBucket.practiceHours += metric.practiceHours;
    }

    const overallHistory = [...metrics].reverse().map((metric) => ({
        id: metric.id,
        date: formatDate(metric.createdAt),
        role: metric.role,
        interviewType: metric.interviewType,
        topic: metric.topic,
        score: metric.score,
        technicalScore: round(metric.technicalScore),
        communicationScore: round(metric.communicationScore),
        practiceHours: round(metric.practiceHours),
        status: metric.status,
        summary: metric.summary || null,
        strengths: metric.strengths,
        weaknesses: metric.weaknesses,
    }));

    const skillEntries = [...skillTotals.values()].map((item) => ({
        ...item,
        scoreDelta: item.strengths - item.weaknesses,
    }));

    const mostImprovedSkill = totalInterviews
        ? skillEntries.filter((item) => item.scoreDelta > 0).sort((a, b) => b.scoreDelta - a.scoreDelta)[0] || null
        : null;
    const weakestSkill = totalInterviews
        ? [...skillEntries].sort((a, b) => a.scoreDelta - b.scoreDelta)[0] || null
        : null;

    const upcomingLearningGoals = totalInterviews ? buildLearningGoals(weakestSkill, skillEntries) : [];

    const weeklyProgress = [...weeklyTotals.values()]
        .sort((a, b) => a.weekStart - b.weekStart)
        .map((item) => ({
            weekStart: item.weekStart.toISOString(),
            weekEnd: item.weekEnd.toISOString(),
            interviewsCompleted: item.interviewsCompleted,
            averageScore: round(item.scoreTotal / item.interviewsCompleted),
            technicalScore: round(item.technicalTotal / item.interviewsCompleted),
            communicationScore: round(item.communicationTotal / item.interviewsCompleted),
            practiceHours: round(item.practiceHours),
        }));

    const monthlyProgress = [...monthlyTotals.values()]
        .sort((a, b) => a.monthStart - b.monthStart)
        .map((item) => ({
            monthStart: item.monthStart.toISOString(),
            monthLabel: item.monthStart.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
            interviewsCompleted: item.interviewsCompleted,
            averageScore: round(item.scoreTotal / item.interviewsCompleted),
            technicalScore: round(item.technicalTotal / item.interviewsCompleted),
            communicationScore: round(item.communicationTotal / item.interviewsCompleted),
            practiceHours: round(item.practiceHours),
        }));

    const topicAccuracy = [...topicTotals.values()]
        .map((item) => ({
            topic: item.topic,
            interviewCount: item.interviewCount,
            averageScore: round(item.scoreTotal / item.interviewCount),
            accuracy: round((item.scoreTotal / item.interviewCount)),
            growth: round((item.technicalTotal + item.communicationTotal) / (item.interviewCount * 2) - (item.scoreTotal / item.interviewCount)),
            lastPracticedAt: formatDate(item.lastPracticedAt),
        }))
        .sort((a, b) => b.interviewCount - a.interviewCount || b.averageScore - a.averageScore);

    const skillSeries = weeklyProgress.map((item) => ({ date: item.weekStart, value: item.averageScore }));
    const communicationSeries = weeklyProgress.map((item) => ({ date: item.weekStart, value: item.communicationScore }));
    const technicalSeries = weeklyProgress.map((item) => ({ date: item.weekStart, value: item.technicalScore }));
    const practiceSeries = weeklyProgress.map((item) => ({ date: item.weekStart, value: item.practiceHours }));

    return {
        dashboard: {
            totalInterviews,
            averageScore,
            hoursPracticed,
            currentStreak,
            averageTechnicalScore,
            averageCommunicationScore,
            mostImprovedSkill: mostImprovedSkill?.label || null,
            weakestSkill: weakestSkill?.label || null,
            latestFeedback,
            upcomingLearningGoals,
        },
        analytics: {
            weeklyProgress,
            monthlyProgress,
            topicAccuracy,
            interviewHistory: overallHistory,
            skillGrowth: skillSeries,
            communicationGrowth: communicationSeries,
            technicalGrowth: technicalSeries,
            practiceTime: {
                totalHours: hoursPracticed,
                series: practiceSeries,
            },
        },
        progress: {
            weeklyProgress,
            monthlyProgress,
            skillGrowth: skillSeries,
            communicationGrowth: communicationSeries,
            technicalGrowth: technicalSeries,
            practiceTime: {
                totalHours: hoursPracticed,
                series: practiceSeries,
            },
        },
        topics: {
            topicAccuracy,
            mostImprovedSkill: mostImprovedSkill?.label || null,
            weakestSkill: weakestSkill?.label || null,
        },
    };
};

const buildLearningGoals = (weakestSkill, skillEntries) => {
    const rankedSkills = [...skillEntries]
        .sort((a, b) => a.scoreDelta - b.scoreDelta)
        .slice(0, 3)
        .map((item) => item.label);

    if (!weakestSkill) {
        return [];
    }

    return rankedSkills.map((skill) => ({
        skill,
        suggestion: `Review recent ${skill.toLowerCase()} answers and practice one focused drill this week.`,
    }));
};

const calculateStreak = (sortedDays) => {
    if (!sortedDays.length) {
        return 0;
    }

    const activitySet = new Set(sortedDays);
    const latest = new Date(`${sortedDays[0]}T00:00:00.000Z`);
    const today = new Date();
    const todayKey = toDateKey(today);
    const latestKey = sortedDays[0];

    if (todayKey !== latestKey) {
        const ageInDays = Math.floor((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth(), latest.getUTCDate())) / 86400000);

        if (ageInDays > 1) {
            return 0;
        }
    }

    let streak = 0;
    const cursor = new Date(latest);

    while (activitySet.has(toDateKey(cursor))) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
};

const loadUserSessions = async (userId) => {
    return prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            role: true,
            interviewType: true,
            status: true,
            currentTopic: true,
            createdAt: true,
            feedbacks: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                    score: true,
                    strengths: true,
                    weaknesses: true,
                    followUpQuestion: true,
                    currentTopic: true,
                    conversationSummary: true,
                    createdAt: true,
                },
            },
            recordings: {
                select: {
                    durationSeconds: true,
                },
            },
        },
    });
};

const getAnalyticsView = async (userId) => {
    const sessions = await loadUserSessions(userId);

    return buildAnalyticsView(sessions);
};

export const getDashboardAnalytics = async ({ userId }) => {
    const analytics = await getAnalyticsView(userId);
    return analytics.dashboard;
};

export const getFullAnalytics = async ({ userId }) => {
    const analytics = await getAnalyticsView(userId);
    return analytics.analytics;
};

export const getProgressAnalytics = async ({ userId }) => {
    const analytics = await getAnalyticsView(userId);
    return analytics.progress;
};

export const getTopicAnalytics = async ({ userId }) => {
    const analytics = await getAnalyticsView(userId);
    return analytics.topics;
};