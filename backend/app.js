import express from 'express';
import session from 'express-session';
import route from './route/index.js';
import * as dbConnect from './database/index.js';
import cors from 'cors';

const app = express();
const port = 80;

app.use(cors('*'));

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: 'startupcode!adapterz@', // secret key
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // https에서만 동작하게 하려면 true로 변경,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    }),
);

// Routes
app.use('/', route);

// 404 응답
app.use((request, response, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// 서버 에러 500 응답
app.use((error, request, response, next) => {
    response.status(error.status || 500);
    response.send({
        error: {
            message: error.message,
        },
    });
});

// 서버 시작하면 전체 유저 데이터 session_id NULL로 초기화
const initSessionId = async (res, req) => {
    const sql = 'UPDATE user_table SET session_id = NULL;';
    await dbConnect.query(sql, res, req);
};

initSessionId();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
