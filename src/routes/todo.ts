import { Router } from "express";
import mongoose, { ObjectId } from "mongoose";
import { FileModel } from "../models/file";
import { ITodo, TodoModel } from "../models/todo";

if (!process.env.MONGO_URL) {
  throw new Error("Please add the MONGO_URL environment variable");
}

const routes = Router();

let gfs: any;

const url = process.env.MONGO_URL;
const connect = mongoose.createConnection(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.once("open", () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: "uploads",
  });
});

routes.get("/", async (req, res) => {
  try {
    const todos: ITodo[] = await TodoModel.find().exec();
    return res.json(todos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.post("/", async (req, res) => {
  try {
    const todo: ITodo = req.body;
    todo.done = false;
    console.log("creating todo", todo);

    const isTodoExists = await TodoModel.findOne({
      title: todo.title,
    }).exec();

    if (isTodoExists) {
      return res
        .status(409)
        .json({ error: "There is already another todo with this title" });
    }

    todo.deadline = todo.deadline ? new Date(todo.deadline) : new Date();
    todo.fileName = null;
    todo.fileId = null;
    const newTodo = await TodoModel.create(todo);
    return res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.put("/", async (req, res) => {
  try {
    const { _id, title, description, deadline, done }: ITodo = req.body;

    await TodoModel.updateOne(
      {
        _id,
      },
      {
        $set: {
          title,
          description,
          deadline,
          done,
        },
      }
    );

    return res.status(200).json({ message: "Edited" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.put("/check", async (req, res) => {
  try {
    const { _id, done }: ITodo = req.body;
    console.log("check", done);
    await TodoModel.updateOne(
      {
        _id,
      },
      {
        $set: {
          done,
        },
      }
    );

    return res.status(200).json({ message: "Done status changing" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.delete("/", async (req, res) => {
  try {
    const { _id } = req.body;

    console.log("deleting", _id);

    const todo = await TodoModel.findOne({ _id });

    await TodoModel.findOneAndRemove({ _id });

    console.log(todo);
    // delete todo's attachment if it exists

    if (!todo?.fileId) return res.status(200).json({ message: "Removed" });
    console.log("fileId", todo?.fileId);
    console.log("delete todos attachment");
    gfs.delete(
      new mongoose.Types.ObjectId(todo.fileId),
      async (err: any, data: any) => {
        if (err) {
          return res.status(404).json({ err: err });
        }

        await FileModel.findOneAndRemove({ fileId: todo.fileId || "" });
      }
    );

    return res.status(200).json({ message: "Removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.delete("/all", async (req, res) => {
  try {
    await TodoModel.deleteMany({});

    return res.status(200).json({ message: "Removed all elements" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;
