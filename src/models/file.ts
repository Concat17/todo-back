import { model, Schema, Document, Types } from "mongoose";

interface IFile extends Document {
  filename: string;
  fileId: string;
}

const FileSchema = new Schema({
  filename: {
    required: true,
    type: String,
  },
  fileId: {
    required: true,
    type: String,
  },
});

const FileModel = model<IFile>("File", FileSchema);

export { FileModel, IFile };
