import { model, Schema, Document, Types } from "mongoose";

interface ITask extends Document {
  title: string;
  description: string;
  deadline: Date;
  done: boolean;
}

const TaskSchema = new Schema({
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
});

const TaskModel = model<ITask>("Task", TaskSchema);

export { TaskModel, ITask };
