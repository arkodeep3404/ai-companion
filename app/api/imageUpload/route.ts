import { uploadFile } from "@/lib/s3";
import sharp from "sharp";
import { v4 } from "uuid";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return Response.json({ message: "no file found" }, { status: 400 });
  }

  const fileBuffer = await file.arrayBuffer();
  const resizedBuffer = await sharp(Buffer.from(fileBuffer))
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer();

  const uid = v4();
  const url = `${process.env.AWS_CLOUDFRONT_BASE_URL}/${uid}`;

  const image = await uploadFile(resizedBuffer, uid, file.type);
  return Response.json({ url: url }, { status: 200 });
}
