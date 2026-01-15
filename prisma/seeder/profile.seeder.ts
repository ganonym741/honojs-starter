import { Profile } from "@prisma/client";

const ProfileSeeds: Profile[] = [
    {
        userId: 'cmkerbkd000012v75wb5billf',
        bio: `This is the bio for test user 1`,
        address: `Jalan Test No. 1`,
        city: 'Jakarta',
        country: 'Indonesia',
        postalCode: `12345`,
    }
]

export { ProfileSeeds }