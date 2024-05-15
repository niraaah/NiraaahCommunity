import * as dbConnect from '../database/index.js';

const isLoggedIn = async (req, res, next) => {
    const { method, url } = req;
    console.log(`[isLoggedIn] method: ${method}, url: ${url}`);

    const { session } = req.headers;
    const userId =
        req.headers.userid && !Number.isNaN(req.headers.userid)
            ? parseInt(req.headers.userid, 10)
            : null;

    if (!userId) {
        return res.status(401).json({
            status: 401,
            message: 'required_authorization',
            data: null,
        });
    }

    try {
        const userSessionData = await dbConnect.query(
            `SELECT session_id FROM user_table WHERE user_id = ${userId};`,
            res,
        );

        if (
            !userSessionData ||
            userSessionData.length === 0 ||
            session !== userSessionData[0].session_id
        ) {
            return res.status(401).json({
                status: 401,
                message: 'required_authorization',
                data: null,
            });
        }

        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

export default isLoggedIn;
