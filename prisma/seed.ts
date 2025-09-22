//==============================================================
// FILE: prisma/seed.ts
// DESCRIPTION: Seed initial users, authors, categories, and a few books.
//==============================================================


import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();


async function main() {
const adminPass = await bcrypt.hash("Admin@1234", 10);
const userPass = await bcrypt.hash("User@1234", 10);


const admin = await prisma.user.upsert({
where: { email: "admin@example.com" },
update: {},
create: {
email: "admin@example.com",
name: "Admin",
role: "ADMIN",
passwordHash: adminPass,
},
});


const user = await prisma.user.upsert({
where: { email: "user@example.com" },
update: {},
create: {
email: "user@example.com",
name: "Demo User",
role: "USER",
passwordHash: userPass,
},
});

const fiction = await prisma.category.upsert({
where: { name: "Fiction" },
update: {},
create: { name: "Fiction" },
});
const tech = await prisma.category.upsert({
where: { name: "Technology" },
update: {},
create: { name: "Technology" },
});


const asimov = await prisma.author.upsert({
where: { name: "Isaac Asimov" },
update: {},
create: { name: "Isaac Asimov" },
});


await prisma.book.createMany({
data: [
{
title: "Foundation",
subtitle: "",
description: "A science fiction classic.",
priceCents: 1299,
currency: "usd",
inventory: 25,
coverUrl: "https://covers.openlibrary.org/b/id/10523339-L.jpg",
},
{
title: "Learning TypeScript",
description: "Practical TS for modern apps.",
priceCents: 3599,
currency: "usd",
inventory: 40,
coverUrl: "https://covers.openlibrary.org/b/id/10591104-L.jpg",
},
],
skipDuplicates: true,
});


const foundation = await prisma.book.findFirst({ where: { title: "Foundation" } });
if (foundation) {
await prisma.book.update({
where: { id: foundation.id },
data: {
authors: { connect: [{ id: asimov.id }] },
categories: { connect: [{ id: fiction.id }] },
},
});
}


console.log({ admin, user, fiction, tech });
}


main().catch((e) => {
console.error(e);
process.exit(1);
}).finally(async () => {
await prisma.$disconnect();
});