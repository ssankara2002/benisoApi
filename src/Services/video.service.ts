import { PrismaClient, Video } from '@prisma/client';
import { VideoCreateData, VideoUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllVideos = async () => {
  return await prisma.video.findMany({
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
      niveau: true,
      matiere: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getVideoById = async (id: number) => {
  return await prisma.video.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
      niveau: true,
      matiere: true,
    },
  });
};

const createVideo = async (data: VideoCreateData) => {
  return await prisma.video.create({
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
      niveau: true,
      matiere: true,
    },
  });
};

const updateVideo = async (id: number, data: VideoUpdateData) => {
  return await prisma.video.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
      niveau: true,
      matiere: true,
    },
  });
};

const deleteVideo = async (id: number) => {
  return await prisma.video.delete({
    where: { id },
  });
};

const getVideosByNiveau = async (niveauId: number) => {
  return await prisma.video.findMany({
    where: { niveauId },
    include: {
      user: { select: { nom: true, prenom: true } },
      niveau: true,
      matiere: true,
    },
    orderBy: { id: 'desc' }
  });
};

const getVideosByMatiere = async (matiereId: number) => {
  return await prisma.video.findMany({
    where: { matiereId },
    include: {
      user: { select: { nom: true, prenom: true } },
      niveau: true,
      matiere: true,
    },
    orderBy: { id: 'desc' }
  });
};

export default {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideosByNiveau,
  getVideosByMatiere,
};