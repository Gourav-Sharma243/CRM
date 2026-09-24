import {Router} from "express";
import {
    getTasks, createTask, updateTask, deleteTask
} from "../controllers/task.controller.js";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();

router.route("/")
    .get(authenticateUser, getTasks)
    .post(authenticateUser, createTask);

router.route("/:id")
    .put(authenticateUser, updateTask)
    .delete(authenticateUser, deleteTask);

export default router;