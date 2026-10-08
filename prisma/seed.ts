import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profileI18n = {
  id: {
    title: 'Konsultan SAP & Profesional IT',
    bio: 'Lulusan Sistem Informasi dengan pengalaman di SAP S/4HANA (SD, MM, PM), mencakup persiapan data, testing, cutover, dukungan migrasi, dan dukungan go-live. Saya juga berpengalaman mengembangkan aplikasi web dan mobile menggunakan React, React Native, Laravel, dan Firebase, sehingga mampu menjembatani kebutuhan bisnis dan implementasi teknis.',
    location: 'Jakarta, Indonesia',
  },
};

const astragraphiaI18n = {
  id: {
    position: 'SAP Consultant',
    period: 'Des 2025 - Sep 2026',
    description: 'Mendukung rollout dan migrasi SAP S/4HANA untuk Auto2000, mencakup persiapan data, cleansing, validasi, testing, cutover, dukungan migrasi, bantuan pengguna, dan dukungan pasca go-live. Berkoordinasi dengan pengguna dan manajemen cabang selama rollout, serta mendukung operasional cabang hingga proses bisnis kembali normal.',
  },
};

const plnI18n = {
  id: {
    position: 'Staf Magang IT',
    period: 'Jun 2024 - Agu 2024',
    description: 'Mengembangkan dan mendukung sistem manajemen inventaris untuk Divisi Information System & Technology, mencakup pengembangan aplikasi, testing, dokumentasi, dan deployment menggunakan Laravel dan Firebase.',
  },
};

const inventoryI18n = {
  en: {
    title: 'Inventory Mobile App',
    summary: 'Mobile inventory app for monitoring warehouse stock in real time.',
    problem: 'Stock recording was still manual and often out of sync between the warehouse and the office.',
    solution: 'A React Native app with real-time synchronization powered by Firebase.',
    role: 'Full Stack Developer',
  },
  id: {
    title: 'Aplikasi Inventory Mobile',
    summary: 'Aplikasi inventory mobile untuk memantau stok gudang secara real-time.',
    problem: 'Pencatatan stok masih manual dan sering tidak sinkron antara gudang dan kantor.',
    solution: 'Aplikasi React Native dengan sinkronisasi real-time menggunakan Firebase.',
    role: 'Full Stack Developer',
  },
};

const portfolioI18n = {
  en: {
    title: 'Portfolio Platform',
    summary: 'Portfolio website with an admin dashboard and a RAG-based AI assistant.',
    problem: 'A static portfolio cannot answer specific visitor questions.',
    solution: 'A chatbot that retrieves context from the database before answering.',
    role: 'Full Stack Developer',
  },
  id: {
    title: 'Platform Portfolio',
    summary: 'Website portfolio dengan dashboard admin dan asisten AI berbasis RAG.',
    problem: 'Portfolio statis tidak bisa menjawab pertanyaan pengunjung secara spesifik.',
    solution: 'Chatbot yang mengambil konteks dari database sebelum menjawab.',
    role: 'Full Stack Developer',
  },
};

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD wajib di .env');

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' },
  });

  await prisma.profile.deleteMany();
  await prisma.profile.create({
    data: {
      name: 'Satrio Tegar Nurwicaksono',
      title: 'SAP Consultant & IT Professional',
      bio: 'Information Systems graduate with experience in SAP S/4HANA (SD, MM, PM), covering data preparation, testing, cutover, migration support, and go-live support. I also have experience developing web and mobile applications using React, React Native, Laravel, and Firebase, allowing me to bridge business requirements and technical implementation.',
      location: 'Jakarta, Indonesia',
      github: 'https://github.com/BOGAR18',
      linkedin: 'https://linkedin.com/in/username',
      photoUrl: '/images/profile.jpg',
      cvUrl: 'https://drive.google.com/file/d/1LGNh-3ggwjK86KD0sSQKpX6tmnQtEbcB/view?usp=sharing',
      translations: profileI18n,
    },
  });

  await prisma.experience.deleteMany();
  await prisma.experience.createMany({
    data: [
      {
        company: 'Astragraphia Information Technology (AGIT)',
        position: 'SAP Consultant',
        period: 'Dec 2025 - Sep 2026',
        description: 'Supported SAP S/4HANA rollout and migration activities for Auto2000, covering data preparation, cleansing, validation, testing, cutover, migration support, user assistance, and post-go-live support. Coordinated with users and branch management during rollout activities and supported branch operations until business processes returned to normal.',
        technologies: ['SAP S/4HANA', 'SAP SD', 'SAP MM', 'SAP PM', 'Data Migration', 'UAT', 'Cutover'],
        order: 1,
        translations: astragraphiaI18n,
      },
      {
        company: 'PT PLN (Persero) UID Jawa Timur',
        position: 'IT Staff Intern',
        period: 'Jun 2024 - Aug 2024',
        description: 'Developed and supported an inventory management system for the Information System & Technology Division, including application development, testing, documentation, and deployment using Laravel and Firebase.',
        technologies: ['Laravel', 'PHP', 'Firebase', 'MySQL', 'REST API'],
        order: 2,
        translations: plnI18n,
      },
    ],
  });

  const skillData: [string, string, number][] = [
    ['SAP S/4HANA', 'SAP', 4],
    ['SAP SD', 'SAP', 4],
    ['SAP MM', 'SAP', 4],
    ['SAP PM', 'SAP', 3],
    ['React', 'Frontend', 4],
    ['TypeScript', 'Frontend', 4],
    ['JavaScript', 'Frontend', 4],
    ['React Native', 'Mobile', 4],
    ['Laravel', 'Backend', 4],
    ['PHP', 'Backend', 4],
    ['Firebase', 'Backend', 4],
    ['REST API', 'Backend', 4],
    ['MySQL', 'Database', 4],
    ['PostgreSQL', 'Database', 3],
    ['Figma', 'Design', 4],
  ];
  const skillIds: Record<string, string> = {};
  for (const [name, category, level] of skillData) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: { category, level },
      create: { name, category, level },
    });
    skillIds[name] = skill.id;
  }

  await prisma.project.upsert({
    where: { slug: 'inventory-mobile' },
    update: { translations: inventoryI18n },
    create: {
      slug: 'inventory-mobile',
      title: 'Warehouse Inventory Mobile App',
      summary: 'Mobile inventory application for managing warehouse stock and branch requests with real-time data synchronization.',
      problem: 'Inventory requests, incoming and outgoing goods, and branch transactions required a more structured way to be recorded and monitored across warehouse operations.',
      solution: 'Built a React Native mobile application integrated with Firebase to support inventory transactions, branch requests, approvals, and real-time data synchronization.',
      role: 'Full Stack Developer',
      category: 'React Native',
      featured: true,
      translations: inventoryI18n,
      skills: {
        create: [
          { skillId: skillIds['React Native'] },
          { skillId: skillIds['Firebase'] },
          { skillId: skillIds['JavaScript'] },
        ],
      },
    },
  });

  await prisma.project.upsert({
    where: { slug: 'portfolio-platform' },
    update: { translations: portfolioI18n },
    create: {
      slug: 'portfolio-platform',
      title: 'Personal Portfolio Platform',
      summary: 'Interactive personal portfolio platform showcasing SAP consulting experience, software development projects, and technical skills.',
      problem: 'A traditional portfolio provides limited context about technical experience and makes it difficult for visitors to explore projects and professional capabilities.',
      solution: 'Built a modern portfolio platform with structured professional information, project showcases, technical skills, and an AI assistant powered by contextual data from the application database.',
      role: 'Full Stack Developer',
      category: 'Full Stack',
      featured: true,
      githubUrl: 'https://github.com/BOGAR18/portfolio-platform',
      translations: portfolioI18n,
      skills: {
        create: [
          { skillId: skillIds['React'] },
          { skillId: skillIds['TypeScript'] },
          { skillId: skillIds['PostgreSQL'] },
          { skillId: skillIds['REST API'] },
        ],
      },
    },
  });

  console.log('Seed selesai.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());