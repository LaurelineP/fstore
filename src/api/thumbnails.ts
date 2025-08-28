import { getBearerToken, validateJWT } from "../auth";
import { respondWithJSON } from "./json";
import { getVideo, updateVideo } from "../db/videos";
import type { ApiConfig } from "../config";
import type { BunRequest } from "bun";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors";

type Thumbnail = {
  data: ArrayBuffer;
  mediaType: string;
};

const videoThumbnails: Map<string, Thumbnail> = new Map();

export async function handlerGetThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { videoId } = req.params as { videoId?: string };
  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const video = getVideo(cfg.db, videoId);
  if (!video) {
    throw new NotFoundError("Couldn't find video");
  }

  const thumbnail = videoThumbnails.get(videoId);
  if (!thumbnail) {
    throw new NotFoundError("Thumbnail not found");
  }

  return new Response(thumbnail.data, {
    headers: {
      "Content-Type": thumbnail.mediaType,
      "Cache-Control": "no-store",
    },
  });
}

export async function handlerUploadThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { videoId } = req.params as { videoId?: string };
  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  console.log("uploading thumbnail for video", videoId, "by user", userID);

  const reqFormData = await req.formData()
  const file = reqFormData.get('thumbnail')
  if ( !(file instanceof File) ){
    throw new BadRequestError('Invalid file thumbnail')
  }

  // Validating file size
  const MAX_UPLOAD_SIZE = 10 << 20
  const mediaSize = Number(reqFormData.get('size'))
  
  if( mediaSize > MAX_UPLOAD_SIZE){
    throw new BadRequestError('Invalid file size')
  }

  // Prepare values to update
  const mediaType = file.type
  const mediaBuffer = await file.arrayBuffer()


  // Retrieve video
  const videoData = await getVideo(cfg.db, videoId)
  if( videoData?.userID !== userID ){
    throw new UserForbiddenError("Invalid video user")
  }

  // Updates video in cache
  videoThumbnails.set(videoData.id, {
    data: mediaBuffer,
    mediaType: mediaType
  })

  // Thumbnail URL updated
  const thumbnailURL = `http://localhost:${cfg.port}/api/thumbnails/${videoData.id}`
  const videoUpdates = {
    ...videoData,
    thumbnailURL
  }
  await updateVideo(cfg.db, videoUpdates)

  return respondWithJSON(200, { video: videoUpdates });
}
