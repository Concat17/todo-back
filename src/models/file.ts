import { model, Schema, Document, Types } from "mongoose";

interface IFile extends Document {
  caption: string;
  filename: string;
  fileId: string;
}

const FileSchema = new Schema({
  caption: {
    required: true,
    type: String,
  },
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
