import { getBearerToken, validateJWT } from "../auth";
import { respondWithJSON } from "./json";
import { getVideo, updateVideo } from "../db/videos";
import { BadRequestError, UserForbiddenError } from "./errors";

import type { ApiConfig } from "../config";
import type { BunRequest } from "bun";


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
  const mediaSize = Number(reqFormData.get('size'))
  
  if( mediaSize > MAX_UPLOAD_SIZE){
    throw new BadRequestError('Invalid file size')
  }

  // Prepare values to update
  const mediaType = file.type
  const mediaBuffer = Buffer.from(await file.arrayBuffer()).toString("base64")
  const dataBufferUrl = `data:${mediaType};base64,${mediaBuffer}`


  // Retrieve video
  const videoData = await getVideo(cfg.db, videoId)
  if( videoData?.userID !== userID ){
    throw new UserForbiddenError("Invalid video user")
  }

  // Thumbnail URL updated
  const thumbnailURL = dataBufferUrl
  const videoUpdates = {
    ...videoData,
    thumbnailURL
  }
  await updateVideo(cfg.db, videoUpdates)

  return respondWithJSON(200, { video: videoUpdates });
}
