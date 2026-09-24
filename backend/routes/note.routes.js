import {Router} from 'express';
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote
} from "../controllers/note.controller.js";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateUser);
router.route('/')
    .get(getNotes)
    .post(createNote);

router.route('/:id')
    .put(updateNote)
    .delete(deleteNote);

export default router;