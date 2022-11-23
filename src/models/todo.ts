import { model, Schema, Document, Types } from "mongoose";

interface ITodo extends Document {
  title: string;
  description: string;
  deadline: Date;
  done: boolean;
  fileName: string | null;
  fileId: string | null;
}

const TodoSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  deadline: {
    type: Date,
  },
  done: {
    type: Boolean,
  },
  fileName: {
    type: String,
  },
  fileId: {
    type: String,
  },
});

const TodoModel = model<ITodo>("Todo", TodoSchema);

export { TodoModel, ITodo };
