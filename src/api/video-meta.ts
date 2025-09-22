import { getBearerToken, validateJWT } from "../auth";
import { createVideo, deleteVideo, getVideo, getVideos } from "../db/videos";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors";
import { respondWithJSON } from "./json";

import { type ApiConfig } from "../config";
import type { BunRequest } from "bun";
import { buildDistributed } from "../s3";

export async function handlerVideoMetaCreate(cfg: ApiConfig, req: Request) {
  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  const { title, description } = await req.json();
  if (!title || !description) {
    throw new BadRequestError("Missing title or description");
  }

  const video = createVideo(cfg.db, {
    userID,
    title,
    description,
  });

  return respondWithJSON(201, video);
}

export async function handlerVideoMetaDelete(cfg: ApiConfig, req: BunRequest) {
  const { videoId } = req.params as { videoId?: string };
  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  const video = getVideo(cfg.db, videoId);
  if (!video) {
    throw new NotFoundError("Couldn't find video");
  }
  if (video.userID !== userID) {
    throw new UserForbiddenError("Not authorized to delete this video");
  }

  deleteVideo(cfg.db, videoId);
  return new Response(null, { status: 204 });
}

export async function handlerVideoGet(cfg: ApiConfig, req: BunRequest) {
  const { videoId } = req.params as { videoId?: string };
  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const video = getVideo(cfg.db, videoId);
  if (!video || !video.videoURL) {
    throw new NotFoundError("Couldn't find video");
  }
  
  const distributedVideoUrl = buildDistributed(cfg, video.videoURL)
  video.videoURL = distributedVideoUrl
  return respondWithJSON(200, video);
}

export async function handlerVideosRetrieve(cfg: ApiConfig, req: Request) {
  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  const videos = getVideos(cfg.db, userID);
  const distributedVideos = videos.map( v => ({
    ...v,
    videoURL: buildDistributed(cfg, v?.videoURL || '')
  }))

  return respondWithJSON(200,  distributedVideos);
}
