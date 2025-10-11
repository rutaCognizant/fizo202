import prisma from '~/../lib/prisma';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const {
    name,
    age,
    gender,
    pushups,
    crunches,
    running,
  }: {
    name: string;
    age: number;
    gender: string;
    pushups: number;
    crunches: number;
    running: number;
  } = body;

  // Here you can process the data as needed
  // console.log("Processed Data:", {
  //   name,
  //   age,
  //   gender,
  //   pushups,
  //   crunches,
  //   running,
  // });

  let user = await prisma.user.findFirst({
    where: { name },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        age,
        gender,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user?.id ?? '' },
      data: {
        age,
        gender,
      },
    });
  }

  // Save the data to the database
  const activity = await prisma.activity.create({
    data: {
      pushups,
      crunches,
      running,
      userId: user.id,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      activities: { connect: { id: activity.id } },
    },
  });

  return {
    id: activity.id,
  };
});
