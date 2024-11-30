import {PrismaClient} from "@prisma/client"

const globalForPrisma = global as unknown as {prisma?: PrismaClient}

export const db = globalForPrisma.prisma || new PrismaClient({        // by default we export prisma
    log:["error"]                       // log:["query","error"]
})

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;


/*
The global object in Node.js does not have a prisma property by default.

Production Environment:
A new instance of PrismaClient is always created.

Development Environment:
The instance is stored in the global object to reuse the same instance across hot reloads, avoiding connection issues.
*/