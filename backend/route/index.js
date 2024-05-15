import express from 'express';
import usersRoute from './userRoute.js'; // 사용자 라우트
import postsRoute from './postRoute.js'; // 게시물 라우트
import filesRoute from './fileRoute.js'; // 파일 라우트
import commentsRoute from './commentRoute.js'; // 댓글 라우트

const router = express.Router();

// 각 라우트를 수동으로 설정
router.use(usersRoute);
router.use(postsRoute);
router.use(filesRoute);
router.use(commentsRoute);

export default router;
