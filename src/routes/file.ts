import express from "express";
import mongoose, { ObjectId } from "mongoose";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import crypto from "crypto";
import path from "path";
import { IFile, FileModel } from "../models/file";
import { TodoModel } from "../models/todo";

if (!process.env.MONGO_URL) {
  throw new Error("Please add the MONGO_URL environment variable");
}

const routes = express.Router();

const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: "uploads",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

const url = process.env.MONGO_URL;
const connect = mongoose.createConnection(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs: any;

connect.once("open", () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: "uploads",
  });
});

routes.get("/", async (req, res) => {
  console.log("getting all files");
  try {
    const todos: IFile[] = await FileModel.find().exec();
    return res.json(todos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

/*
        GET: Fetches a particular file by todoId
    */
routes.route("/:todoId").get(async (req, res, next) => {
  console.log("getting file", req.params.todoId);
  const file = await FileModel.findOne({
    todoId: req.params.todoId,
  }).exec();

  if (!file)
    return res.status(200).json({
      success: false,
      message: "No files available",
    });

  gfs
    .find({ filename: file.filename })
    .toArray((err: any, files: string | any[]) => {
      if (!files[0] || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No files available",
        });
      }

      res.status(200).json({
        success: true,
        file: files[0],
      });
    });
});

/* 
                GET: Fetches a particular file by todoId and render on browser
        */
routes.route("/download/:todoId").get(async (req, res, next) => {
  console.log("downloading file", req.params.todoId);
  const file = await FileModel.findOne({
    todoId: req.params.todoId,
  }).exec();

  if (!file)
    return res.status(200).json({
      success: false,
      message: "No files available",
    });

  console.log(file.filename);
  gfs
    .find({ filename: file.filename })
    .toArray((err: any, files: string | any[]) => {
      if (!files[0] || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No files available",
        });
      }
      console.log("stream");
      gfs.openDownloadStreamByName(file.filename).pipe(res);
    });
});

/*
      POST: Upload a single image/file to File collection
  */
routes
  .route("/")
  .post(upload.single("file"), async (req, res, next) => {
    console.log("uploading file", req.body);
    // check for existing files
    FileModel.findOne({ caption: req.body.caption })
      .then(async (file) => {
        console.log(file);
        if (file) {
          return res.status(200).json({
            success: false,
            message: "File already exists",
          });
        }

        if (!req?.file) return;

        const f: any = req.file;

        let newFile = new FileModel({
          caption: req.body.caption,
          filename: f.filename,
          fileId: f.id,
        });

        const todo = await TodoModel.findOne({
          _id: req.body.todoId,
        }).exec();

        if (!todo) {
          return res.status(200).json({
            success: false,
            message: "Todo for file is not found",
          });
        }

        todo.fileName = f.filename;

        await TodoModel.updateOne(
          {
            _id: req.body.todoId,
          },
          {
            $set: { ...todo },
          }
        );

        newFile
          .save()
          .then((file) => {
            res.status(200).json({
              success: true,
              file,
            });
          })
          .catch((err) => res.status(500).json(err));
      })
      .catch((err) => res.status(500).json(err));
  })
  .get((req, res, next) => {
    FileModel.find({})
      .then((files) => {
        res.status(200).json({
          success: true,
          files,
        });
      })
      .catch((err) => res.status(500).json(err));
  });

/*
      DELETE: Delete a particular file by an ID
  */
// imageRouter.route("/file/del/:id").post((req, res, next) => {
//   console.log(req.params.id);
//   gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
//     if (err) {
//       return res.status(404).json({ err: err });
//     }

//     res.status(200).json({
//       success: true,
//       message: `File with ID ${req.params.id} is deleted`,
//     });
//   });
// });
export default routes;
