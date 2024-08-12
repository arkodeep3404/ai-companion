import { NextRequest, NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import multer from "multer";
import { uploadFile } from "@/lib/s3";
import sharp from "sharp";
import { v4 } from "uuid";

interface MulterFile extends File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface ExtendedRequest extends NextRequest {
  file?: MulterFile;
}

const router = createEdgeRouter<ExtendedRequest, NextResponse>();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.use(upload.single("image"));

router.post(async (req: ExtendedRequest) => {
  if (!req.file) {
    console.log("file-1", req.file);
    return NextResponse.json({ message: "no file found" }, { status: 400 });
  }

  const file = req.file;
  console.log("file-2", file);

  const fileBuffer = await sharp(file.buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer();

  const image = await uploadFile(fileBuffer, v4(), file.mimetype);
  return NextResponse.json({ image: image }, { status: 200 });
});

export async function POST(req: ExtendedRequest, res: NextResponse) {
  return router.run(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
