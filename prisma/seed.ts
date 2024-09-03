// prisma/seed.ts

import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const seeding_count = 100

async function main() {
    for (let i = 0; i < seeding_count; i++) {
        const first_name = faker.person.firstName()
        const last_name = faker.person.lastName()
        const churros_uid = first_name[0] + last_name + faker.number.int({ max: 100 })

        await prisma.user.create({
            data: {
                id: faker.string.uuid(),
                first_name: first_name,
                last_name: last_name,
                email: faker.internet.email(
                    { firstName: first_name, lastName: last_name }
                ),
                churros_uid: churros_uid.toLowerCase()
            },
        })
    }
}

main().then(async () => {
    await prisma.$disconnect()
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})