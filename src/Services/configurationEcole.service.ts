import prisma from '../prismaClient';

const get = async () => {
  const config = await prisma.configurationEcole.findFirst();
  return config;
};

const upsert = async (data: {
  nomEcole: string;
  ville?: string;
  devise?: string;
  ministere?: string;
  directionRegionale?: string;
  directionProvinciale?: string;
  codeRegion?: string;
  codeProvince?: string;
  codeEcole?: string;
}) => {
  const existing = await prisma.configurationEcole.findFirst();
  if (existing) {
    return prisma.configurationEcole.update({ where: { id: existing.id }, data });
  }
  return prisma.configurationEcole.create({ data });
};

export default { get, upsert };
