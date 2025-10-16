import { prisma } from "../src/lib/prisma";

async function main() {
  const requests = await prisma.projectRequest.findMany();
  console.log("Existing ProjectRequest records:", JSON.stringify(requests, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
