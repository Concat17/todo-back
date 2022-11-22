import { Router } from "express";
import { Types } from "mongoose";
import { ITodo, TodoModel } from "../models/todo";

const routes = Router();

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

    return res.status(200).json({ message: "Done status changed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.delete("/", async (req, res) => {
  try {
    const todo: ITodo = req.body;

    console.log("deleting", todo);

    await TodoModel.findOneAndRemove({ _id: todo._id });

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
