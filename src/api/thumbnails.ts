import path from 'path'
import { getBearerToken, validateJWT } from "../auth";
import { respondWithJSON } from "./json";
import { getVideo, updateVideo } from "../db/videos";
import { BadRequestError, UserForbiddenError } from "./errors";

import type { ApiConfig } from "../config";
import type { BunRequest } from "bun";
import { randomBytes } from 'crypto';


export async function handlerUploadThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { videoId } = req.params as { videoId?: string };
  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  console.info("uploading thumbnail for video", videoId, "by user", userID);

  const reqFormData = await req.formData()
  const file = reqFormData.get('thumbnail')
  if ( !(file instanceof File) ){
    throw new BadRequestError('Invalid file thumbnail')
  }

  // Validating file size
  const MAX_UPLOAD_SIZE = 10 << 20
  const mediaSize = file.size

  if( mediaSize > MAX_UPLOAD_SIZE){
    throw new BadRequestError('Invalid file size')
  }


  // Retrieve video in DB
  const videoData = await getVideo(cfg.db, videoId)
  if( videoData?.userID !== userID ){
    throw new UserForbiddenError("Invalid user's video")
  }

  // Prepare values to update
  const mediaType = file.type
  if( !["image/png", 'image/jpeg'].includes( mediaType )){
    throw new BadRequestError("Invalid file extension")
  }

  const thumbnailBuffer = await file.arrayBuffer()
  
  // Prepare file path
  const fileExtension = mediaType.split('/')[1]
  const randomThumbnailName = await randomBytes(32).toString('base64url')
  const thumbnailPath = path.join(cfg.assetsRoot,`${randomThumbnailName}.${fileExtension}`)

  // Store in file system
  await Bun.write(thumbnailPath, thumbnailBuffer)

  // Thumbnail URL updated
  const videoUpdates = {
    ...videoData,
    thumbnailURL: `http://localhost:${cfg.port}/${thumbnailPath}`
  }
  await updateVideo(cfg.db, videoUpdates)

  return respondWithJSON(200, { video: videoUpdates });
}
