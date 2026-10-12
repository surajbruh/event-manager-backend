export function generateFilename(file: Express.Multer.File) {
  const fileExtension = file.originalname.split(".").pop();
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
}
