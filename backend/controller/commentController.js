import mysql from 'mysql2/promise';
import * as commentModel from '../model/commentModel.js';

// 댓글 작성
export const writeComment = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        if (!request.body.commentContent)
            return response.status(400).json({
                status: 400,
                message: 'invalid_comment_content',
                data: null,
            });

        if (request.body.commentContent.length > 1000)
            return response.status(400).json({
                status: 400,
                message: 'invalid_comment_content_length',
                data: null,
            });

        const postId = request.params.post_id;
        const { commentContent } = request.body;
        const userId = request.headers.userid;

        const requestData = {
            postId: mysql.escape(postId),
            userId: mysql.escape(userId),
            commentContent: mysql.escape(commentContent),
        };
        const results = await commentModel.writeComment(requestData, response);

        if (!results)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        if (results === 'insert_error')
            return response.status(500).json({
                status: 500,
                message: 'internal_server_error',
                data: null,
            });

        return response.status(201).json({
            status: 201,
            message: 'write_comment_success',
            data: null,
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 댓글 조회
export const getComments = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        const postId = request.params.post_id;

        const requestData = {
            postId: mysql.escape(postId),
        };
        const results = await commentModel.getComments(requestData, response);
        console.log(results);
        if (!results)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_comment',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 댓글 수정
export const updateComment = async (request, response) => {
    if (!request.params.post_id)
        return response.status(400).json({
            status: 400,
            message: 'invalid_post_id',
            data: null,
        });
    if (!request.params.comment_id)
        return response.status(400).json({
            status: 400,
            message: 'invalid_comment_id',
            data: null,
        });
    if (!request.body.commentContent)
        return response.status(400).json({
            status: 400,
            message: 'invalid_comment_content',
            data: null,
        });
    if (request.body.commentContent.length > 1000)
        return response.status(400).json({
            status: 400,
            message: 'invalid_comment_content_length',
            data: null,
        });
    try {
        const postId = request.params.post_id;
        const commentId = request.params.comment_id;
        const userId = request.headers.userid;
        const { commentContent } = request.body;

        const requestData = {
            postId: mysql.escape(postId),
            commentId: mysql.escape(commentId),
            userId: mysql.escape(userId),
            commentContent: mysql.escape(commentContent),
        };
        const results = await commentModel.updateComment(requestData, response);

        if (!results)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        if (results === 'update_error')
            return response.status(500).json({
                status: 500,
                message: 'internal_server_error',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'update_comment_success',
            data: null,
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 댓글 삭제
export const softDeleteComment = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        if (!request.params.comment_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_comment_id',
                data: null,
            });

        const postId = request.params.post_id;
        const commentId = request.params.comment_id;
        const userId = request.headers.userid;

        const requestData = {
            postId: mysql.escape(postId),
            commentId: mysql.escape(commentId),
            userId: mysql.escape(userId),
        };
        const results = await commentModel.softDeleteComment(
            requestData,
            response,
        );

        if (!results)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        if (results === 'delete_error')
            return response.status(500).json({
                status: 500,
                message: 'internal_server_error',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'delete_comment_success',
            data: null,
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};
