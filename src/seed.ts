import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/user.model";
import {
  Event,
  type EventCategory,
  type EventStatus,
} from "./models/event.model";
import bcrypt from "bcrypt";

interface EventSeed {
  image: string;
  title: string;
  description: string;
  location: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  capacity: number;
  isFeatured: boolean;
  status: EventStatus;
}

for (const k of ["MONGODB_URI"]) {
  if (!process.env[k]) {
    console.error(`Missing ${k}. Copy .env.example to .env first.`);
    process.exit(1);
  }
}

const credentials = {
  name: "admin",
  email: "admin@event.com",
  password: "password123",
};

const events: EventSeed[] = [
  {
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    title: "Mumbai Tech Summit",
    description:
      "A technology conference featuring talks on artificial intelligence, cloud computing, cybersecurity, and modern software development.",
    location: "Jio World Convention Centre, Mumbai",
    category: "Tech",
    startDate: new Date("2026-11-14T09:00:00+05:30"),
    endDate: new Date("2026-11-14T18:00:00+05:30"),
    capacity: 800,
    isFeatured: true,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    title: "React and TypeScript Workshop",
    description:
      "A practical workshop covering reusable React components, TypeScript fundamentals, API integration, and frontend project structure.",
    location: "Andheri East, Mumbai",
    category: "Workshop",
    startDate: new Date("2026-10-24T10:00:00+05:30"),
    endDate: new Date("2026-10-24T16:00:00+05:30"),
    capacity: 60,
    isFeatured: true,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
    title: "Indie Music Night",
    description:
      "An evening of live performances by independent artists, local bands, and emerging musicians.",
    location: "Bandra West, Mumbai",
    category: "Music",
    startDate: new Date("2026-11-07T18:00:00+05:30"),
    endDate: new Date("2026-11-07T22:00:00+05:30"),
    capacity: 250,
    isFeatured: true,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80f",
    title: "Community Beach Cleanup",
    description:
      "Join local volunteers to collect litter, promote responsible waste disposal, and help keep the beach clean.",
    location: "Juhu Beach, Mumbai",
    category: "Community",
    startDate: new Date("2026-10-18T07:00:00+05:30"),
    endDate: new Date("2026-10-18T10:00:00+05:30"),
    capacity: 120,
    isFeatured: false,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    title: "Node.js Backend Bootcamp",
    description:
      "A hands-on learning session about REST APIs, authentication, database design, error handling, testing, and deployment with Node.js.",
    location: "Powai, Mumbai",
    category: "Workshop",
    startDate: new Date("2026-11-21T09:30:00+05:30"),
    endDate: new Date("2026-11-22T16:30:00+05:30"),
    capacity: 90,
    isFeatured: true,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    title: "Startup Founders Meetup",
    description:
      "A networking event for aspiring entrepreneurs and early-stage founders featuring short talks and peer discussions.",
    location: "Lower Parel, Mumbai",
    category: "Community",
    startDate: new Date("2026-11-11T17:00:00+05:30"),
    endDate: new Date("2026-11-11T20:00:00+05:30"),
    capacity: 150,
    isFeatured: false,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
    title: "Electronic Music Festival",
    description:
      "A high-energy music festival featuring electronic music DJs, immersive lighting, and live performances.",
    location: "Navi Mumbai",
    category: "Music",
    startDate: new Date("2026-12-05T17:00:00+05:30"),
    endDate: new Date("2026-12-05T23:00:00+05:30"),
    capacity: 1200,
    isFeatured: true,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    title: "MongoDB Data Modeling Lab",
    description:
      "Learn practical MongoDB schema design, indexing, aggregation pipelines, and query optimization through guided exercises.",
    location: "Thane, Maharashtra",
    category: "Tech",
    startDate: new Date("2026-10-29T10:00:00+05:30"),
    endDate: new Date("2026-10-29T15:00:00+05:30"),
    capacity: 45,
    isFeatured: false,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    title: "Open Source Contribution Day",
    description:
      "Meet developers, discover beginner-friendly open-source issues, and learn collaborative Git workflows with mentor support.",
    location: "Fort, Mumbai",
    category: "Tech",
    startDate: new Date("2026-11-28T10:00:00+05:30"),
    endDate: new Date("2026-11-28T17:00:00+05:30"),
    capacity: 100,
    isFeatured: true,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d",
    title: "South Mumbai Photography Walk",
    description:
      "Explore street photography and practice composition, natural lighting, and visual storytelling with fellow photographers.",
    location: "Kala Ghoda, Mumbai",
    category: "Community",
    startDate: new Date("2026-10-25T07:00:00+05:30"),
    endDate: new Date("2026-10-25T11:00:00+05:30"),
    capacity: 35,
    isFeatured: false,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    title: "Cloud Deployment Essentials",
    description:
      "An introductory session on deploying web applications, configuring environment variables, reading logs, and preparing services for production.",
    location: "Online",
    category: "Workshop",
    startDate: new Date("2026-11-03T14:00:00+05:30"),
    endDate: new Date("2026-11-03T17:00:00+05:30"),
    capacity: 200,
    isFeatured: false,
    status: "published",
  },
  {
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    title: "Campus Cultural Gathering",
    description:
      "A student-led community gathering with performances, games, and opportunities to connect with students from different courses.",
    location: "Mumbai, Maharashtra",
    category: "Community",
    startDate: new Date("2026-09-20T10:00:00+05:30"),
    endDate: new Date("2026-09-20T18:00:00+05:30"),
    capacity: 300,
    isFeatured: false,
    status: "completed",
  },
];

(async () => {
  {
    const mongoURI = process.env.MONGODB_URI!;
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected!");

    if (await User.findOne({ email: credentials.email }))
      return console.log("Admin login: admin@event.com / password123");

    const hashedPassword = await bcrypt.hash(credentials.password, 12);
    const adminUser = await User.insertOne({
      ...credentials,
      password: hashedPassword,
      role: "admin",
    });

    if (!adminUser) throw new Error("Unable to create admin user");

    if ((await Event.countDocuments()) !== 0) return;

    await Event.insertMany(
      events.map((ev) => ({ ...ev, organizer: adminUser._id })),
    );

    console.log("Seeded. Admin login: admin@event.com / password123");
    await mongoose.disconnect();
  }
})();
