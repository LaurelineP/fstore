import { S3Client } from "bun";
import { spawnPipedFileProcess } from "./video.utils";
import type { ApiConfig } from "../../config";
import type { Video } from "../../db/videos";

export async function getVideoMetada(filepath: string){
  // Create process for metadata
  const ffprobeProcess = await spawnPipedFileProcess(
    ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", filepath]
  )

  // Reads JSON metadata
  const outputData = await new Response(ffprobeProcess.stdout).json();

  // Calculates ratio with metadata width and height
  const { height, width } = outputData.streams[0]
  const ratioValue = Number(width/height).toPrecision(3)

  // Resolves aspect ratio
  const is16_9 = Number(16/9).toPrecision(3) === ratioValue
  const is9_16 = Number(9/16).toPrecision(3) === ratioValue
  const storageName = is16_9
    ? 'landscape'
    : is9_16
      ? 'portrait' : 'other';

  return storageName
}



export async function createVideoForFastStart(absVideoPath: string) {
  const fastStartTmpPath = absVideoPath.replace('.mp4', '.processed.mp4')

  // Creates process fo moov atom file
  await spawnPipedFileProcess(
    ["ffmpeg", "-i", absVideoPath, "-movflags", "+faststart", "-map_metadata", "0", "-codec", "copy", "-f", "mp4", fastStartTmpPath ],
  )

  return fastStartTmpPath
}


export function generatePresignedS3URL(cfg: ApiConfig, key: string, expireTime: number = 3000) {
  const presignedURL = S3Client.presign(key, {
    endpoint: cfg.s3Endpoint,
    expiresIn: expireTime,
    bucket: cfg.s3Bucket
  })
  return presignedURL
}

// Aka. dbVideoToSignedVideo
export function signDBVideo (cfg: ApiConfig, video: Video){ 
  if( !video?.videoURL ) return video
  const presigned = generatePresignedS3URL( cfg, video.videoURL )
  return {
    ...video,
    videoURL: presigned,
  } as Video
}