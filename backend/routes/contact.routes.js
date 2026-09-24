import {Router} from 'express';
import {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact
} from "../controllers/contact.controller.js";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);
router.route('/')
    .get(getContacts)
    .post(createContact);

router.route('/:id')
    .get(getContact)
    .put(updateContact)
    .delete(deleteContact);

export default router;