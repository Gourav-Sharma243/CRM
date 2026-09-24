import {Lead} from "../models/Lead.js";
import {Contact} from "../models/Contact.js";
import {Task} from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const [leads, contactCount, openTasks] = await Promise.all([
        Lead.find({ owner: userId }),
        Contact.countDocuments({ owner: userId }),
        Task.countDocuments({ owner: userId, status: { $ne: "Completed" } }),
    ]);

    const stages = ["New", "Qualified", "Proposal", "Won", "Lost"];
    const byStage = Object.fromEntries(stages.map((s) => [s, { count: 0, value: 0 }]));
    let totalValue = 0;
    let wonValue = 0;

    for (const lead of leads) {
        const bucket = byStage[lead.status] || (byStage[lead.status] = { count: 0, value: 0 });
        bucket.count += 1;
        bucket.value += lead.value || 0;
        totalValue += lead.value || 0;
        if (lead.status === "Won") wonValue += lead.value || 0;
    }

    const won = byStage.Won?.count || 0;
    const lost = byStage.Lost?.count || 0;
    const closed = won + lost;
    const conversionRate = closed ? Math.round((won / closed) * 100) : 0;

    const months = lastSixMonths();
    const trend = months.map(({ label }) => ({ month: label, leads: 0, won: 0 }));
    const indexByKey = Object.fromEntries(months.map((m, i) => [m.key, i]));

    for (const lead of leads) {
        const d = new Date(lead.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const index = indexByKey[key];
        if (index !== undefined) {
            trend[index].leads += 1;
            if (lead.status === "Won") trend[index].won += lead.value || 0;
        }
    }

    const recentLeads = [...leads]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 6)
        .map((l) => ({
            id: l._id,
            name: l.name,
            company: l.company,
            status: l.status,
            value: l.value,
            updatedAt: l.updatedAt,
        }));

    const statsObj = {
        revenueWon: wonValue,
        pipelineValue: totalValue,
        totalLeads: leads.length,
        totalContacts: contactCount,
        openTasks,
        conversionRate,
    };

    res.json({
        success: true,
        stats: statsObj,
        status: statsObj,
        pipeline: stages.map((s) => ({
            stage: s,
            count: byStage[s].count,
            value: byStage[s].value,
        })),
        trend,
        recentLeads,
    });
});

const lastSixMonths = () => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const out = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: labels[d.getMonth()],
        });
    }
    return out;
};