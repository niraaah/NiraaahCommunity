import express from 'express';
import * as commentController from '../controller/commentController.js';
import isLoggedIn from '../util/authUtil.js';

const router = express.Router();

router.get(
    '/posts/:post_id/comments',
    isLoggedIn,
    commentController.getComments,
);
router.post(
    '/posts/:post_id/comments',
    isLoggedIn,
    commentController.writeComment,
);
router.patch(
    '/posts/:post_id/comments/:comment_id',
    isLoggedIn,
    commentController.updateComment,
);
router.delete(
    '/posts/:post_id/comments/:comment_id',
    isLoggedIn,
    commentController.softDeleteComment,
);

export default router;