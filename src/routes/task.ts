import { Router } from "express";
import { Types } from "mongoose";
import { ITask, TaskModel } from "../models/task";

const routes = Router();

routes.get("/", async (req, res) => {
  try {
    const tasks: ITask[] = await TaskModel.find().exec();
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.post("/", async (req, res) => {
  try {
    const task: ITask = req.body;
    task.done = false;
    console.log("creating task", task);

    const isTaskExists = await TaskModel.findOne({
      title: task.title,
    }).exec();

    if (isTaskExists) {
      return res
        .status(409)
        .json({ error: "There is already another task with this title" });
    }

    task.deadline = task.deadline ? new Date(task.deadline) : new Date();
    const newTask = await TaskModel.create(task);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.put("/", async (req, res) => {
  try {
    const { _id, title, description, deadline, done }: ITask = req.body;

    await TaskModel.updateOne(
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
    const { _id, done }: ITask = req.body;
    console.log("check", done);
    await TaskModel.updateOne(
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
    const task: ITask = req.body;

    console.log("deleting", task);

    await TaskModel.findOneAndRemove({ _id: task._id });

    return res.status(200).json({ message: "Removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.delete("/all", async (req, res) => {
  try {
    const task: ITask = req.body;

    await TaskModel.deleteMany({});

    return res.status(200).json({ message: "Removed all elements" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;
