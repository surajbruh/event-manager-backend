import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/user.model";
import { Event } from "./models/event.model";
import bcrypt from "bcrypt";

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

const events = [
  {
    title: "Mumbai Tech Meetup 2026",
    description:
      "A networking event for developers, designers, and technology enthusiasts to connect and share ideas.",
    location: "WeWork, BKC, Mumbai",
    startDate: new Date("2026-10-15T10:00:00+05:30"),
    endDate: new Date("2026-10-15T16:00:00+05:30"),
    capacity: 150,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
  },
  {
    title: "React Developers Conference",
    description:
      "Explore modern React development, performance optimization, state management, and scalable frontend architecture.",
    location: "Taj Lands End, Mumbai",
    startDate: new Date("2026-10-20T09:30:00+05:30"),
    endDate: new Date("2026-10-20T17:00:00+05:30"),
    capacity: 300,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
  },
  {
    title: "Startup & Entrepreneurs Meetup",
    description:
      "Meet founders, investors, and aspiring entrepreneurs and learn how to build and scale successful startups.",
    location: "91Springboard, Andheri, Mumbai",
    startDate: new Date("2026-10-24T11:00:00+05:30"),
    endDate: new Date("2026-10-24T15:00:00+05:30"),
    capacity: 120,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
  },
  {
    title: "AI & Machine Learning Workshop",
    description:
      "A hands-on workshop covering machine learning fundamentals, generative AI, and practical AI applications.",
    location: "IIT Bombay, Powai, Mumbai",
    startDate: new Date("2026-10-28T10:00:00+05:30"),
    endDate: new Date("2026-10-28T18:00:00+05:30"),
    capacity: 100,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
  },
  {
    title: "Design Thinking Workshop",
    description:
      "Learn practical design thinking techniques to solve complex problems and create user-focused products.",
    location: "The Leela, Andheri, Mumbai",
    startDate: new Date("2026-11-02T10:00:00+05:30"),
    endDate: new Date("2026-11-02T16:00:00+05:30"),
    capacity: 80,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978",
  },
  {
    title: "JavaScript Masterclass",
    description:
      "Deep dive into modern JavaScript concepts including async programming, closures, prototypes, and performance.",
    location: "WeWork, Lower Parel, Mumbai",
    startDate: new Date("2026-11-07T10:00:00+05:30"),
    endDate: new Date("2026-11-07T17:00:00+05:30"),
    capacity: 200,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
  },
  {
    title: "Photography & Street Walk",
    description:
      "Join fellow photographers for a guided street photography walk through some of Mumbai's iconic locations.",
    location: "Gateway of India, Mumbai",
    startDate: new Date("2026-11-14T07:00:00+05:30"),
    endDate: new Date("2026-11-14T11:00:00+05:30"),
    capacity: 50,
    image: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848",
  },
  {
    title: "Music & Open Mic Night",
    description:
      "An evening of live music, poetry, comedy, and performances by talented local artists.",
    location: "The Habitat, Bandra, Mumbai",
    startDate: new Date("2026-11-20T18:00:00+05:30"),
    endDate: new Date("2026-11-20T22:00:00+05:30"),
    capacity: 100,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
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
