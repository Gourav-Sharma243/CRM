import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Contact } from "./models/Contact.js";
import { Task } from "./models/Task.js";
import { Note } from "./models/Note.js";

const SEED_USER = {
    name: "Gourav Sharma",
    email: "gouravhds10@gmail.com",
    password: "Test@1234",
    role: "owner",
    company: "TTP Technologies",
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

    // 2. Clear old data belonging to this user
    console.log("Clearing previous demo data for this account...");
    await Promise.all([
        Lead.deleteMany({ owner: userId }),
        Contact.deleteMany({ owner: userId }),
        Task.deleteMany({ owner: userId }),
        Note.deleteMany({ owner: userId }),
    ]);

    // 3. Create realistic Contacts
    console.log("Seeding Contacts...");
    const contactsData = [
        {
            owner: userId,
            name: "Noah Carter",
            email: "noah.carter@globex.com",
            phone: "+1 (555) 234-5678",
            company: "Globex Corporation",
            title: "Chief Technology Officer",
            tags: ["champion", "executive", "tech-lead"],
            notes: "Direct contact for infrastructure upgrades. Very interested in AI pipeline automation.",
            favorite: true,
            favourite: true,
            createdAt: daysAgo(45),
        },
        {
            owner: userId,
            name: "Sarah Connor",
            email: "sarah.c@acmecloud.io",
            phone: "+1 (555) 876-5432",
            company: "Acme Cloud",
            title: "VP of Engineering",
            tags: ["decision-maker", "enterprise"],
            notes: "Leading cloud migration initiatives. Focus on SOC2 compliance and SSO integration.",
            favorite: true,
            favourite: true,
            createdAt: daysAgo(60),
        },
        {
            owner: userId,
            name: "Peter Gibbons",
            email: "peter@initechcorp.com",
            phone: "+1 (555) 345-6789",
            company: "Initech",
            title: "Head of Product",
            tags: ["influencer", "product"],
            notes: "Evaluating CRM replacements to improve sales velocity and customer tracking.",
            favorite: false,
            favourite: false,
            createdAt: daysAgo(30),
        },
        {
            owner: userId,
            name: "Richard Hendricks",
            email: "richard@piedpiper.com",
            phone: "+1 (555) 456-7890",
            company: "Pied Piper",
            title: "CEO & Founder",
            tags: ["vip", "founder"],
            notes: "High-value strategic account. Rapidly scaling team across North America.",
            favorite: true,
            favourite: true,
            createdAt: daysAgo(15),
        },
        {
            owner: userId,
            name: "Erlich Bachman",
            email: "erlich@aviato.com",
            phone: "+1 (555) 567-8901",
            company: "Aviato Labs",
            title: "Managing Partner",
            tags: ["investor", "advisor"],
            notes: "Introduced through mutual alumni network. Looking at software stack consolidation.",
            favorite: false,
            favourite: false,
            createdAt: daysAgo(90),
        },
    ];

    const contacts = await Contact.insertMany(contactsData);
    const contactMap = Object.fromEntries(contacts.map((c) => [c.name, c]));

    // 4. Create realistic Leads spanning all pipeline stages
    console.log("Seeding Leads across pipeline stages...");
    const leadsData = [
        {
            owner: userId,
            name: "Globex - AI Platform Expansion",
            email: "noah.carter@globex.com",
            phone: "+1 (555) 234-5678",
            company: "Globex Corporation",
            status: "Proposal",
            priority: "High",
            source: "Referral",
            value: 85000,
            notes: "Proposal delivered for enterprise CRM license + custom AI workflows.",
            tags: ["ai", "enterprise", "hot-lead"],
            aiSummary: "Strong executive alignment with CTO Noah Carter. High deal value with imminent budget sign-off.",
            aiRiskScore: 18,
            order: 0,
            createdAt: daysAgo(35),
            updatedAt: daysAgo(2),
        },
        {
            owner: userId,
            name: "Acme Cloud - Enterprise SaaS Migration",
            email: "sarah.c@acmecloud.io",
            phone: "+1 (555) 876-5432",
            company: "Acme Cloud",
            status: "Qualified",
            priority: "High",
            source: "Website",
            value: 65000,
            notes: "Completed discovery call. Validated budget and 200 seat deployment timeline.",
            tags: ["cloud", "migration"],
            aiSummary: "Budget confirmed for Q4. Security evaluation underway with positive preliminary feedback.",
            aiRiskScore: 25,
            order: 0,
            createdAt: daysAgo(50),
            updatedAt: daysAgo(5),
        },
        {
            owner: userId,
            name: "Pied Piper - Sales Team Rollout",
            email: "richard@piedpiper.com",
            phone: "+1 (555) 456-7890",
            company: "Pied Piper",
            status: "Won",
            priority: "High",
            source: "Referral",
            value: 95000,
            notes: "Contract signed! 12-month prepaid annual agreement.",
            tags: ["closed-won", "saas"],
            aiSummary: "Deal successfully closed. Customer onboarded with high NPS sentiment.",
            aiRiskScore: 5,
            order: 0,
            createdAt: daysAgo(75),
            updatedAt: daysAgo(10),
        },
        {
            owner: userId,
            name: "Initech - Security & Audit Suite",
            email: "peter@initechcorp.com",
            phone: "+1 (555) 345-6789",
            company: "Initech",
            status: "New",
            priority: "Medium",
            source: "Cold Outreach",
            value: 40000,
            notes: "Inbound inquiry via webinar registration. Awaiting initial intro meeting.",
            tags: ["security", "inbound"],
            aiSummary: "Early stage prospect. Requires product walkthrough focusing on role-based access control.",
            aiRiskScore: 40,
            order: 0,
            createdAt: daysAgo(5),
            updatedAt: daysAgo(1),
        },
        {
            owner: userId,
            name: "Soylent Corp - Custom CRM Integration",
            email: "bizdev@soylent.com",
            phone: "+1 (555) 678-9012",
            company: "Soylent Corp",
            status: "Qualified",
            priority: "Medium",
            source: "Event",
            value: 50000,
            notes: "Met at SaaStr conference. Interested in integrating leads directly with ERP.",
            tags: ["conference", "integration"],
            aiSummary: "Promising lead with clear technical requirements. Next step is an architecture review call.",
            aiRiskScore: 32,
            order: 1,
            createdAt: daysAgo(20),
            updatedAt: daysAgo(4),
        },
        {
            owner: userId,
            name: "Massive Dynamic - Global Licensing",
            email: "procurement@massivedynamic.com",
            phone: "+1 (555) 789-0123",
            company: "Massive Dynamic",
            status: "Lost",
            priority: "Low",
            source: "Other",
            value: 30000,
            notes: "Chose incumbent provider due to pre-existing legacy vendor agreement.",
            tags: ["lost-competitor"],
            aiSummary: "Deal lost to incumbent. Re-evaluate in 12 months when their vendor contract expires.",
            aiRiskScore: 90,
            order: 0,
            createdAt: daysAgo(110),
            updatedAt: daysAgo(60),
        },
    ];

    const leads = await Lead.insertMany(leadsData);
    const leadMap = Object.fromEntries(leads.map((l) => [l.company, l]));

    // 5. Create realistic Tasks
    console.log("Seeding Tasks...");
    const tasksData = [
        {
            owner: userId,
            title: "Send finalized SLA and contract to Globex",
            description: "Review legal terms with executive team and send over DocuSign envelope to Noah.",
            status: "In Progress",
            priority: "High",
            dueDate: daysFromNow(2),
            relatedLead: leadMap["Globex Corporation"]?._id || null,
            relatedContact: contactMap["Noah Carter"]?._id || null,
        },
        {
            owner: userId,
            title: "Technical architecture review with Sarah Connor",
            description: "Cover SSO, REST API limits, and MongoDB encryption standards.",
            status: "Pending",
            priority: "High",
            dueDate: daysFromNow(4),
            relatedLead: leadMap["Acme Cloud"]?._id || null,
            relatedContact: contactMap["Sarah Connor"]?._id || null,
        },
        {
            owner: userId,
            title: "Demo follow-up email to Peter at Initech",
            description: "Share recording of the live product walkthrough and pricing tiers document.",
            status: "Pending",
            priority: "Medium",
            dueDate: daysFromNow(1),
            relatedLead: leadMap["Initech"]?._id || null,
            relatedContact: contactMap["Peter Gibbons"]?._id || null,
        },
        {
            owner: userId,
            title: "Kickoff onboarding session for Pied Piper",
            description: "Introduce customer success team and set up initial team member invitations.",
            status: "Completed",
            priority: "High",
            dueDate: daysAgo(2),
            completedAt: daysAgo(1),
            relatedLead: leadMap["Pied Piper"]?._id || null,
            relatedContact: contactMap["Richard Hendricks"]?._id || null,
        },
        {
            owner: userId,
            title: "Review Q3 pipeline analytics & forecast report",
            description: "Analyze monthly win rates, deal size distribution, and top conversion channels.",
            status: "Pending",
            priority: "Low",
            dueDate: daysFromNow(7),
        },
    ];

    await Task.insertMany(tasksData);

    // 6. Create realistic Notes
    console.log("Seeding Notes...");
    const notesData = [
        {
            owner: userId,
            content: "Excellent executive review meeting with Noah Carter. The board has approved full procurement for Q4. Expecting signature before month-end.",
            lead: leadMap["Globex Corporation"]?._id || null,
            contact: contactMap["Noah Carter"]?._id || null,
            pinned: true,
            createdAt: daysAgo(3),
        },
        {
            owner: userId,
            content: "Sarah confirmed Acme Cloud's compliance team passed our security review with zero blockers. Ready to schedule technical deep dive.",
            lead: leadMap["Acme Cloud"]?._id || null,
            contact: contactMap["Sarah Connor"]?._id || null,
            pinned: true,
            createdAt: daysAgo(8),
        },
        {
            owner: userId,
            content: "Pied Piper rollout feedback: Team loves the unified lead pipeline and Gemini AI summaries. Zero onboarding hurdles reported.",
            lead: leadMap["Pied Piper"]?._id || null,
            contact: contactMap["Richard Hendricks"]?._id || null,
            pinned: false,
            createdAt: daysAgo(12),
        },
        {
            owner: userId,
            content: "Initech is comparing us with Salesforce. Emphasized our modern UI, fast search, AI-powered sales insights, and lower TCO.",
            lead: leadMap["Initech"]?._id || null,
            contact: contactMap["Peter Gibbons"]?._id || null,
            pinned: false,
            createdAt: daysAgo(4),
        },
    ];

    await Note.insertMany(notesData);

    console.log("\n=======================================================");
    console.log("🎉 Seed Completed Successfully!");
    console.log("=======================================================");
    console.log(`👤 User Email:    ${SEED_USER.email}`);
    console.log(`🔑 User Password: ${SEED_USER.password}`);
    console.log(`📊 Leads:         ${leadsData.length} records`);
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
