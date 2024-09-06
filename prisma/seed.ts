// prisma/seed.ts

import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as argon2 from "argon2";

const prisma = new PrismaClient()
const user_count = 100
const slot_count = 80

async function main() {
    // Seed the database with 100 users
    for (let i = 0; i < user_count; i++) {
        const first_name = faker.person.firstName()
        const last_name = faker.person.lastName()
        const churros_uid = first_name[0] + last_name + faker.number.int({ max: 100 })

        await prisma.user.create({
            data: {
                first_name: first_name,
                last_name: last_name,
                email: faker.internet.email(
                    { firstName: first_name, lastName: last_name }
                ),
                churros_uid: churros_uid.toLowerCase()
            },
        })
    }

    // Seed the database with 20 slots
    const users = await prisma.user.findMany();

    for (let i = 0; i < slot_count; i++) {
        const owner = faker.helpers.arrayElement(users);
        const participants = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 18 }));

        const starts_at = faker.date.between({ from: '2024-08-01T00:00:00.000Z', to: '2024-12-01T00:00:00.000Z' });

        await prisma.slot.create({
            data: {
                name: faker.company.name(),
                description: faker.lorem.paragraph(),

                starts_at: starts_at,
                ends_at: faker.date.between({ from: starts_at, to: '2024-12-01T00:00:00.000Z' }),

                // Assign a random user to the slot as the owner
                owner: {
                    connect: {
                        id: owner.id
                    }
                },
                

                participants: {
                    connect: participants.map((user) => {
                        return {
                            id: user.id
                        }
                    })
                }
            }
        })
    }

    // Add specific users
    const hash = await argon2.hash('azertyuiop');
    await prisma.user.create({
        data: {
            first_name: 'Test',
            last_name: 'Wtf',
            email: 'wtf@test.fr',
            password: hash,
        }
    });
}


main().then(async () => {
    await prisma.$disconnect()
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})