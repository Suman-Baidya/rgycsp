import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

let prismaArgs = {};
if (connectionString) {
  const adapter = new PrismaNeon({ connectionString });
  prismaArgs = { adapter };
}

const prisma = new PrismaClient(prismaArgs);

async function main() {
  console.log("Seeding global site settings...");

  let siteSettings = await prisma.siteSettings.findFirst({
    where: { workspaceId: null },
  });

  const settingsData = {
    siteName: "ABCD Edu Hub",
    logoUrl: "/logo.png",
    primaryColor: "#8b5cf6",
    accentColor: "#3b82f6",
    contactEmail: "sb.abcd321@gmail.com",
    contactPhone: "8944899747",
    address: "Kolkata, West Bengal, India - 700001",
    socialLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
    },
    navigation: [
      { name: "Home", href: "/", id: "home", path: "/" },
      { name: "About", href: "/about", id: "about", path: "/about" },
      { name: "Services", href: "/services", id: "services", path: "/services" },
      { name: "Guide", href: "/guide", id: "guide", path: "/guide" },
      { name: "Pricing", href: "/pricing", id: "pricing", path: "/pricing" },
      { name: "Support", href: "/support", id: "support", path: "/support" }
    ],
  };

  if (siteSettings) {
    siteSettings = await prisma.siteSettings.update({
      where: { id: siteSettings.id },
      data: settingsData,
    });
  } else {
    siteSettings = await prisma.siteSettings.create({
      data: {
        ...settingsData,
        workspaceId: null,
      },
    });
  }

  const sections = [
    {
      type: "hero",
      title: "Hero Section",
      subtitle: "Main landing slider",
      content: {
        slides: [
          {
            src: "https://cdn.pixabay.com/photo/2022/07/21/02/53/business-idea-7335270_1280.jpg",
            title: "Innovative AI Automation",
            subtitle: "Streamline workflows, boost efficiency, reduce effort, empower intelligent decisions."
          },
          {
            src: "https://cdn.pixabay.com/photo/2018/03/10/12/00/teamwork-3213924_1280.jpg",
            title: "Empower Your Educational Team",
            subtitle: "Foster collaboration, provide tools, encourage growth, cultivate supportive culture."
          },
          {
            src: "https://cdn.pixabay.com/photo/2024/11/19/03/43/handshake-9208017_1280.jpg",
            title: "Forge Powerful Partnerships",
            subtitle: "Forge powerful partnerships by cultivating trust, aligning shared goals, and driving innovation together"
          }
        ]
      },
      order: 0,
    },
    {
      type: "about",
      title: "About Us",
      subtitle: "Empowering Education Through Technology",
      content: {
        description: "ABCD Edu Hub is a state-of-the-art Multi-Tenant AI-powered Educational platform designed to bridge the gap between traditional learning and modern technological demands.",
        image: "https://cdn.pixabay.com/photo/2015/05/11/14/44/pencils-762555_1280.jpg",
        stats: [
          { label: "Partner Institutes", value: "500+" },
          { label: "Active Students", value: "50k+" },
          { label: "Success Rate", value: "99%" }
        ]
      },
      order: 1,
    },
    {
      type: "why-choose-us",
      title: "Why Choose Us",
      subtitle: "Unmatched Expertise in Educational Automation",
      content: {
        features: [
          { title: "AI-Powered Efficiency", description: "Our intelligent algorithms automate administrative tasks, saving hundreds of hours weekly." },
          { title: "Multi-Tenant Security", description: "Each institute gets a private, secure, and isolated digital environment for their operations." },
          { title: "Interactive Dashboards", description: "Monitor academic progress, financial health, and attendance in real-time." }
        ]
      },
      order: 2,
    },
    {
      type: "achievements",
      title: "Our Achievements",
      content: {
        stats: [
          { label: "Years Experience", value: 12 },
          { label: "Happy Clients", value: 2500 },
          { label: "Courses Automated", value: 150 },
          { label: "Support Tickets Resolved", value: 10000 }
        ]
      },
      order: 3,
    }
  ];

  for (const section of sections) {
    await prisma.landingSection.upsert({
      where: {
        siteSettingsId_type: {
          siteSettingsId: siteSettings.id,
          type: section.type,
        },
      },
      update: section,
      create: {
        ...section,
        siteSettingsId: siteSettings.id,
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
