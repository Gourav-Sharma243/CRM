import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Contact } from "./models/Contact.js";
import { Task } from "./models/Task.js";
import { Note } from "./models/Note.js";

const SEED_USER = {
    name: "Gourav Sharma",
    email: "gourav@test.ca",
    password: "Test@1234",
    role: "owner",
    company: "Nexus Technologies",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
};

const now = new Date();
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

async function seed() {
    const uri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!uri) {
        console.error("❌ MONGO_URI or MONGO_URL not defined in environment variables");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    // 1. Find or create the seed user
    let user = await User.findOne({ email: SEED_USER.email.toLowerCase() });
    if (user) {
        console.log(`Found existing user ${SEED_USER.email}. Updating password & details...`);
        user.name = SEED_USER.name;
        user.password = SEED_USER.password; // Triggers bcrypt pre-save hash
        user.role = SEED_USER.role;
        user.company = SEED_USER.company;
        user.avatar = SEED_USER.avatar;
        await user.save();
    } else {
        console.log(`Creating seed user: ${SEED_USER.email}`);
        user = await User.create(SEED_USER);
    }

    const userId = user._id;

    // 2. Clear old demo data for this account
    console.log("Clearing previous demo data for this account...");
    await Promise.all([
        Lead.deleteMany({ owner: userId }),
        Contact.deleteMany({ owner: userId }),
        Task.deleteMany({ owner: userId }),
        Note.deleteMany({ owner: userId }),
    ]);

    // 3. Create 25 Realistic Contacts
    console.log("Seeding 25 Contacts...");
    const rawContacts = [
        { name: "Noah Carter", email: "noah.carter@globex.com", phone: "+1 (555) 234-5678", company: "Globex Corporation", title: "Chief Technology Officer", tags: ["champion", "executive"], favorite: true },
        { name: "Sarah Connor", email: "sarah.c@acmecloud.io", phone: "+1 (555) 876-5432", company: "Acme Cloud", title: "VP of Engineering", tags: ["decision-maker", "enterprise"], favorite: true },
        { name: "Peter Gibbons", email: "peter@initechcorp.com", phone: "+1 (555) 345-6789", company: "Initech", title: "Head of Product", tags: ["influencer", "product"], favorite: false },
        { name: "Richard Hendricks", email: "richard@piedpiper.com", phone: "+1 (555) 456-7890", company: "Pied Piper", title: "CEO & Founder", tags: ["vip", "founder"], favorite: true },
        { name: "Erlich Bachman", email: "erlich@aviato.com", phone: "+1 (555) 567-8901", company: "Aviato Labs", title: "Managing Partner", tags: ["investor", "advisor"], favorite: false },
        { name: "Bruce Wayne", email: "bruce@wayneenterprises.com", phone: "+1 (555) 901-2345", company: "Wayne Enterprises", title: "Chairman", tags: ["enterprise", "vip"], favorite: true },
        { name: "Tony Stark", email: "tony@starkindustries.io", phone: "+1 (555) 123-9999", company: "Stark Industries", title: "Chief Innovation Officer", tags: ["tech-lead", "ai"], favorite: true },
        { name: "Miles Dyson", email: "mdyson@cyberdyne.net", phone: "+1 (555) 222-3344", company: "Cyberdyne Systems", title: "Director of R&D", tags: ["research", "security"], favorite: false },
        { name: "Eldon Tyrell", email: "etyrell@tyrellcorp.com", phone: "+1 (555) 333-4455", company: "Tyrell Corporation", title: "President & CEO", tags: ["executive", "enterprise"], favorite: false },
        { name: "Gillian Seed", email: "gillian@snatcher.org", phone: "+1 (555) 444-5566", company: "Snatcher Dynamics", title: "VP Sales Ops", tags: ["operations"], favorite: false },
        { name: "Walter White", email: "walter@polloslogistics.com", phone: "+1 (555) 555-6677", company: "Los Pollos Logistics", title: "Head of Supply Chain", tags: ["logistics", "champion"], favorite: true },
        { name: "Gordon Gekko", email: "ggekko@gekkocapital.com", phone: "+1 (555) 666-7788", company: "Gekko & Co", title: "Managing Director", tags: ["finance", "decision-maker"], favorite: true },
        { name: "Don Draper", email: "draper@sterlingcooper.com", phone: "+1 (555) 777-8899", company: "Sterling Cooper Digital", title: "Creative Director", tags: ["marketing"], favorite: false },
        { name: "Art Vandelay", email: "art@vandelayindustries.com", phone: "+1 (555) 888-9900", company: "Vandelay Industries", title: "Lead Architect & Importer", tags: ["architecture"], favorite: false },
        { name: "Gavin Belson", email: "gavin@hooli.com", phone: "+1 (555) 999-0011", company: "Hooli", title: "Chief Executive Officer", tags: ["enterprise", "vip"], favorite: true },
        { name: "Dina Meyer", email: "dina@buynlarge.com", phone: "+1 (555) 111-2233", company: "Buy 'N Large", title: "VP Global Procurement", tags: ["procurement"], favorite: false },
        { name: "Cave Johnson", email: "cave@aperturescience.com", phone: "+1 (555) 222-7788", company: "Aperture Science", title: "Founder & CEO", tags: ["founder", "ai"], favorite: true },
        { name: "Gordon Freeman", email: "gfreeman@blackmesa.gov", phone: "+1 (555) 333-8899", company: "Black Mesa Research", title: "Research Fellow", tags: ["technical"], favorite: false },
        { name: "Ellen Ripley", email: "ripley@weylandcorp.com", phone: "+1 (555) 444-9900", company: "Weyland-Yutani", title: "Warrant Officer", tags: ["operations", "security"], favorite: true },
        { name: "Carol Miller", email: "mom@momcorp.com", phone: "+1 (555) 555-0011", company: "MomCorp SaaS", title: "Chief Executive", tags: ["enterprise", "champion"], favorite: false },
        { name: "Jim Halpert", email: "jim@dundermifflin.com", phone: "+1 (555) 666-1122", company: "Dunder Mifflin Tech", title: "VP Regional Sales", tags: ["sales", "champion"], favorite: true },
        { name: "Pam Beesly", email: "pam@dundermifflin.com", phone: "+1 (555) 777-2233", company: "Dunder Mifflin Tech", title: "Office Administrator", tags: ["operations"], favorite: false },
        { name: "Jack Donaghy", email: "jdonaghy@gec.com", phone: "+1 (555) 888-3344", company: "General Electric Co", title: "VP East Coast Television", tags: ["executive", "vip"], favorite: true },
        { name: "Dwight Schrute", email: "dwight@schrutefarms.io", phone: "+1 (555) 999-4455", company: "Schrute Agrotech", title: "Owner & Operator", tags: ["agritech"], favorite: false },
        { name: "Leslie Knope", email: "leslie@pawneegov.org", phone: "+1 (555) 123-4567", company: "Pawnee Digital Services", title: "Director of Public Initiatives", tags: ["public-sector", "champion"], favorite: true },
    ];

    const contactsData = rawContacts.map((c, i) => ({
        ...c,
        owner: userId,
        favourite: c.favorite,
        notes: `Key stakeholder for ${c.company}. Regular touchpoints scheduled.`,
        createdAt: daysAgo(5 + i * 4),
    }));

    const contacts = await Contact.insertMany(contactsData);
    const contactMap = Object.fromEntries(contacts.map((c) => [c.company, c]));

    // 4. Create 25 Realistic Leads across all stages
    console.log("Seeding 25 Leads across all pipeline stages...");
    const rawLeads = [
        // --- WON (Closed Revenue) ---
        { company: "Globex Corporation", name: "Globex - AI Platform Expansion", value: 85000, status: "Won", priority: "High", source: "Referral", tags: ["ai", "enterprise", "hot-lead"], days: 85 },
        { company: "Pied Piper", name: "Pied Piper - Sales Team Rollout", value: 95000, status: "Won", priority: "High", source: "Referral", tags: ["closed-won", "saas"], days: 75 },
        { company: "Wayne Enterprises", name: "Wayne Ent - Global Operations Suite", value: 140000, status: "Won", priority: "High", source: "Website", tags: ["enterprise", "vip", "tier-1"], days: 60 },
        { company: "Snatcher Dynamics", name: "Snatcher - Field Team Modernization", value: 45000, status: "Won", priority: "Medium", source: "Event", tags: ["field-ops"], days: 40 },
        { company: "Gekko & Co", name: "Gekko Capital - Private Wealth CRM", value: 110000, status: "Won", priority: "High", source: "Referral", tags: ["fintech", "high-value"], days: 25 },

        // --- PROPOSAL (High Intent, Nearing Close) ---
        { company: "Acme Cloud", name: "Acme Cloud - Enterprise SaaS Migration", value: 65000, status: "Proposal", priority: "High", source: "Website", tags: ["cloud", "migration"], days: 30 },
        { company: "Stark Industries", name: "Stark Ind - Clean Energy Sales Cloud", value: 125000, status: "Proposal", priority: "High", source: "Event", tags: ["energy", "strategic"], days: 22 },
        { company: "Aperture Science", name: "Aperture - Research Portal License", value: 72000, status: "Proposal", priority: "High", source: "Referral", tags: ["research", "portal"], days: 18 },
        { company: "Weyland-Yutani", name: "Weyland - Remote Outpost Management", value: 90000, status: "Proposal", priority: "Medium", source: "Cold Outreach", tags: ["telemetry", "enterprise"], days: 14 },
        { company: "General Electric Co", name: "GEC - Broadcast Sales Workflow", value: 80000, status: "Proposal", priority: "High", source: "Website", tags: ["media", "broadcasting"], days: 10 },

        // --- QUALIFIED (Confirmed Budget & Need) ---
        { company: "Cyberdyne Systems", name: "Cyberdyne - AI Model Training Sync", value: 55000, status: "Qualified", priority: "High", source: "Website", tags: ["ai", "security"], days: 35 },
        { company: "Tyrell Corporation", name: "Tyrell - Nexus Operations Suite", value: 68000, status: "Qualified", priority: "Medium", source: "Cold Outreach", tags: ["biotech"], days: 28 },
        { company: "Los Pollos Logistics", name: "Los Pollos - Fleet Management Integration", value: 48000, status: "Qualified", priority: "Medium", source: "Event", tags: ["fleet", "logistics"], days: 21 },
        { company: "Sterling Cooper Digital", name: "Sterling Cooper - Ad Campaign CRM", value: 38000, status: "Qualified", priority: "Medium", source: "Social", tags: ["agency", "marketing"], days: 16 },
        { company: "Hooli", name: "Hooli - Nucleus Sales Integration", value: 75000, status: "Qualified", priority: "High", source: "Referral", tags: ["cloud", "tier-1"], days: 12 },
        { company: "Buy 'N Large", name: "BNL - Global Retail Automation", value: 85000, status: "Qualified", priority: "High", source: "Website", tags: ["retail", "ecommerce"], days: 8 },

        // --- NEW (Fresh Inbound / Pipeline Top) ---
        { company: "Initech", name: "Initech - Security & Audit Suite", value: 40000, status: "New", priority: "Medium", source: "Cold Outreach", tags: ["security", "inbound"], days: 7 },
        { company: "Vandelay Industries", name: "Vandelay - Latex Import Automation", value: 25000, status: "New", priority: "Low", source: "Website", tags: ["manufacturing"], days: 5 },
        { company: "Black Mesa Research", name: "Black Mesa - Facility Asset Tracking", value: 52000, status: "New", priority: "Medium", source: "Referral", tags: ["scientific"], days: 4 },
        { company: "MomCorp SaaS", name: "MomCorp - Delivery Bot Fleet Sync", value: 60000, status: "New", priority: "High", source: "Website", tags: ["automation"], days: 3 },
        { company: "Dunder Mifflin Tech", name: "Dunder Mifflin - Northeast Sales CRM", value: 32000, status: "New", priority: "Medium", source: "Cold Outreach", tags: ["regional-sales"], days: 2 },
        { company: "Schrute Agrotech", name: "Schrute Agro - Organic Supply CRM", value: 18000, status: "New", priority: "Low", source: "Social", tags: ["agritech"], days: 1 },
        { company: "Pawnee Digital Services", name: "Pawnee - Citizen Request System", value: 28000, status: "New", priority: "Medium", source: "Website", tags: ["civic", "government"], days: 1 },

        // --- LOST (Benchmark / Competitor Comparison) ---
        { company: "Massive Dynamic", name: "Massive Dynamic - Custom Telemetry Engine", value: 50000, status: "Lost", priority: "Low", source: "Other", tags: ["lost-incumbent"], days: 95 },
        { company: "Aviato Labs", name: "Aviato - Ride Share Logistics Backend", value: 35000, status: "Lost", priority: "Low", source: "Social", tags: ["pricing-sensitive"], days: 65 },
    ];

    const leadsData = rawLeads.map((l, i) => {
        const contact = contactMap[l.company];
        return {
            owner: userId,
            name: l.name,
            company: l.company,
            email: contact?.email || `sales@${l.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            phone: contact?.phone || "+1 (555) 000-1122",
            status: l.status,
            priority: l.priority,
            source: l.source,
            value: l.value,
            tags: l.tags,
            notes: `High priority sales conversation with ${l.company}. Target rollout timeline confirmed.`,
            aiSummary: `${l.status} deal for ${l.company}. Estimated ARR: $${l.value.toLocaleString()}. Next milestone: commercial contract review.`,
            aiRiskScore: l.status === "Won" ? 5 : l.status === "Lost" ? 95 : Math.floor(15 + (i * 3) % 45),
            order: i % 5,
            createdAt: daysAgo(l.days),
            updatedAt: daysAgo(Math.max(1, Math.floor(l.days / 3))),
        };
    });

    const leads = await Lead.insertMany(leadsData);
    const leadMap = Object.fromEntries(leads.map((l) => [l.company, l]));

    // 5. Create 25 Realistic Tasks across statuses
    console.log("Seeding 25 Tasks...");
    const rawTasks = [
        { title: "Send finalized SLA and contract to Globex", status: "In Progress", priority: "High", company: "Globex Corporation", dueOffset: 2 },
        { title: "Technical architecture review with Sarah Connor", status: "Pending", priority: "High", company: "Acme Cloud", dueOffset: 4 },
        { title: "Demo follow-up email to Peter at Initech", status: "Pending", priority: "Medium", company: "Initech", dueOffset: 1 },
        { title: "Kickoff onboarding session for Pied Piper", status: "Completed", priority: "High", company: "Pied Piper", dueOffset: -2, completedOffset: -1 },
        { title: "Review Q3 pipeline analytics & forecast report", status: "Pending", priority: "Low", dueOffset: 7 },
        { title: "Prepare custom security whitepaper for Wayne Enterprises", status: "In Progress", priority: "High", company: "Wayne Enterprises", dueOffset: 3 },
        { title: "Review Stark Industries clean energy API spec", status: "Pending", priority: "High", company: "Stark Industries", dueOffset: 5 },
        { title: "Schedule follow-up call with Miles Dyson on AI governance", status: "Pending", priority: "Medium", company: "Cyberdyne Systems", dueOffset: 6 },
        { title: "Send revised commercial pricing proposal to Tyrell Corp", status: "Pending", priority: "Medium", company: "Tyrell Corporation", dueOffset: 2 },
        { title: "Confirm telemetry sync specs with Snatcher Dynamics", status: "Completed", priority: "Medium", company: "Snatcher Dynamics", dueOffset: -5, completedOffset: -4 },
        { title: "Logistics ERP mapping call with Los Pollos team", status: "In Progress", priority: "Medium", company: "Los Pollos Logistics", dueOffset: 1 },
        { title: "Deliver executive briefing deck to Gordon Gekko", status: "Completed", priority: "High", company: "Gekko & Co", dueOffset: -8, completedOffset: -7 },
        { title: "Ad campaign integration discovery with Don Draper", status: "Pending", priority: "Low", company: "Sterling Cooper Digital", dueOffset: 8 },
        { title: "Review architectural blueprint for Vandelay Industries", status: "Pending", priority: "Low", company: "Vandelay Industries", dueOffset: 9 },
        { title: "Enterprise agreement legal review with Hooli counsel", status: "In Progress", priority: "High", company: "Hooli", dueOffset: 3 },
        { title: "Retail catalog sync test with Buy 'N Large engineering", status: "Pending", priority: "High", company: "Buy 'N Large", dueOffset: 4 },
        { title: "Portal API performance benchmarks review for Aperture", status: "In Progress", priority: "Medium", company: "Aperture Science", dueOffset: 2 },
        { title: "Asset tracking demo for Black Mesa research division", status: "Pending", priority: "Medium", company: "Black Mesa Research", dueOffset: 5 },
        { title: "Outpost monitoring agreement follow-up with Ellen Ripley", status: "Pending", priority: "High", company: "Weyland-Yutani", dueOffset: 1 },
        { title: "Sync with MomCorp procurement on delivery bot integration", status: "Pending", priority: "Medium", company: "MomCorp SaaS", dueOffset: 6 },
        { title: "Northeast regional sales rep onboarding with Jim Halpert", status: "Pending", priority: "Medium", company: "Dunder Mifflin Tech", dueOffset: 3 },
        { title: "Send product demo recording to Pam Beesly", status: "Completed", priority: "Low", company: "Dunder Mifflin Tech", dueOffset: -3, completedOffset: -2 },
        { title: "Executive quarterly sync with Jack Donaghy at GEC", status: "In Progress", priority: "High", company: "General Electric Co", dueOffset: 2 },
        { title: "Organic agritech lead qualification follow-up with Dwight", status: "Pending", priority: "Low", company: "Schrute Agrotech", dueOffset: 10 },
        { title: "Civic portal compliance checklist review with Leslie Knope", status: "Completed", priority: "Medium", company: "Pawnee Digital Services", dueOffset: -1, completedOffset: -1 },
    ];

    const tasksData = rawTasks.map((t) => {
        const lead = t.company ? leadMap[t.company] : null;
        const contact = t.company ? contactMap[t.company] : null;
        return {
            owner: userId,
            title: t.title,
            description: `Action item associated with ${t.company || "General Account Maintenance"}. Complete prior to deadline.`,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueOffset >= 0 ? daysFromNow(t.dueOffset) : daysAgo(-t.dueOffset),
            completedAt: t.completedOffset ? daysAgo(-t.completedOffset) : null,
            relatedLead: lead?._id || null,
            relatedContact: contact?._id || null,
        };
    });

    await Task.insertMany(tasksData);

    // 6. Create 20 Realistic Notes
    console.log("Seeding 20 Notes...");
    const rawNotes = [
        { company: "Globex Corporation", pinned: true, content: "Executive review complete. Board approved full procurement for enterprise license and custom AI workflows." },
        { company: "Acme Cloud", pinned: true, content: "Sarah Connor confirmed Acme's compliance team passed our security review with zero blockers. Ready for technical deep dive." },
        { company: "Pied Piper", pinned: false, content: "Rollout feedback: Team loves the unified lead pipeline and Gemini AI summaries. Zero onboarding hurdles reported." },
        { company: "Wayne Enterprises", pinned: true, content: "Strategic partnership validated by Bruce Wayne. Enterprise security requirements include SSO, SOC2 Type II, and VPC peering." },
        { company: "Stark Industries", pinned: true, content: "Tony Stark requested real-time telemetry streaming into their internal StarkOS dashboard. Architecture specs shared." },
        { company: "Cyberdyne Systems", pinned: false, content: "Discussed data isolation for neural network training workloads. They are satisfied with our tenant isolation guarantees." },
        { company: "Initech", pinned: false, content: "Initech is comparing us with Salesforce. Emphasized our modern UI, fast search, AI-powered sales insights, and lower TCO." },
        { company: "Aperture Science", pinned: true, content: "Cave Johnson loved the portal demo. Emphasized our automated lead scoring and webhook dispatch speed." },
        { company: "Tyrell Corporation", pinned: false, content: "Nexus model integration requirements: Must support 50,000 requests per minute with <100ms p99 latency." },
        { company: "Los Pollos Logistics", pinned: false, content: "Supply chain team needs direct sync with cold storage delivery manifests. Scheduling technical walkthrough." },
        { company: "Gekko & Co", pinned: true, content: "Contract finalized. Annual prepaid retainer with premium 24/7 SLA. Great win for our enterprise portfolio." },
        { company: "Sterling Cooper Digital", pinned: false, content: "Creative agency seeking multi-brand client workspaces. Demonstrated role-based permissions." },
        { company: "Vandelay Industries", pinned: false, content: "Art Vandelay requested custom shipping status badge colors. Simple config tweak." },
        { company: "Hooli", pinned: false, content: "Gavin Belson's team evaluated the migration script from HooliSuite. Data export completed seamlessly." },
        { company: "Buy 'N Large", pinned: false, content: "Global procurement team requested 3-year multi-year discounting tier. Preparing customized ROI schedule." },
        { company: "Black Mesa Research", pinned: false, content: "Research grant approved for anomalous materials tracking module. Expected pilot start next month." },
        { company: "Weyland-Yutani", pinned: false, content: "Commercial terms agreed. Warrant Officer Ripley confirmed operational readiness for off-world facility testing." },
        { company: "General Electric Co", pinned: true, content: "Jack Donaghy approved East Coast division rollout. Stressed importance of executive KPI dashboards." },
        { company: "Dunder Mifflin Tech", pinned: false, content: "Jim Halpert noted the sales team was able to log calls 4x faster compared to their legacy CRM." },
        { company: "Pawnee Digital Services", pinned: false, content: "Leslie Knope shared enthusiastic feedback regarding our citizen feedback intake forms and response speed." },
    ];

    const notesData = rawNotes.map((n, i) => {
        const lead = leadMap[n.company];
        const contact = contactMap[n.company];
        return {
            owner: userId,
            content: n.content,
            pinned: n.pinned,
            lead: lead?._id || null,
            contact: contact?._id || null,
            createdAt: daysAgo(2 + i * 3),
        };
    });

    await Note.insertMany(notesData);

    console.log("\n=======================================================");
    console.log("🎉 Mega Seed Completed Successfully!");
    console.log("=======================================================");
    console.log(`👤 User Email:    ${SEED_USER.email}`);
    console.log(`🔑 User Password: ${SEED_USER.password}`);
    console.log(`📊 Leads:         ${leadsData.length} records (across 5 pipeline stages)`);
    console.log(`👥 Contacts:      ${contactsData.length} records`);
    console.log(`✅ Tasks:         ${tasksData.length} records`);
    console.log(`📝 Notes:         ${notesData.length} records`);
    console.log("=======================================================\n");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
