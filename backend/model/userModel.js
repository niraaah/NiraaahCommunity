import bcrypt from 'bcrypt';
import * as dbConnect from '../database/index.js';

// 회원가입
export const signUpUser = async (requestData, response) => {
    const { email, password, nickname } = requestData;

    const sql = `
    INSERT INTO user_table
    (email, password, nickname)
    VALUES (${email}, ${password}, ${nickname});
    `;

    const results = await dbConnect.query(sql, response);
    return results.insertId;
};

export const uploadProfileImage = async (requestData, response) => {
    const { userId, profileImagePath } = requestData;

    const profileImagePathSql = `
    INSERT INTO file_table
    (user_id, file_path, file_category)
    VALUES (${userId}, ${profileImagePath}, 1);
    `;
    const profileResults = await dbConnect.query(profileImagePathSql, response);

    const userProfileSql = `
    UPDATE user_table
    SET file_id = ${profileResults.insertId}
    WHERE user_id = ${userId};
    `;

    const userProfileResults = await dbConnect.query(userProfileSql, response);
    return userProfileResults.insertId;
};

// 로그인
export const loginUser = async (requestData, response) => {
    const reqPassword = requestData.password.slice(1, -1);
    const sql = `SELECT * FROM user_table WHERE email = ${requestData.email} AND deleted_at IS NULL;`;
    const results = await dbConnect.query(sql, response);

    if (!results[0] || results[0] === 'undefined' || results[0] === undefined)
        return null;

    const match = await bcrypt.compare(reqPassword, results[0].password);
    if (!match) return null;

    if (results[0].file_id !== null) {
        const profileSql = `SELECT file_path FROM file_table WHERE file_id = ${results[0].file_id} AND deleted_at IS NULL AND file_category = 1;`;
        const profileResults = await dbConnect.query(profileSql, response);
        console.log(profileResults);
        results[0].profileImagePath = profileResults[0].file_path;
    } else {
        results[0].profileImagePath = '/public/image/profile/default.png';
    }

    const user = {
        userId: results[0].user_id,
        email: results[0].email,
        nickname: results[0].nickname,
        profileImagePath: results[0].profile_image_path,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        deleted_at: results[0].deleted_at,
    };

    return user;
};

export const getUser = async (requestData, response) => {
    const { userId } = requestData;

    /**
     * LEFT JOIN
     * - LEFT JOIN은 왼쪽 테이블을 기준으로 오른쪽 테이블을 연결하는 방식이다.
     *
     * COALESCE
     * - COALESCE는 NULL을 다른 값으로 대체하는 함수이다.
     * - COALESCE(값1, 값2, 값3, ...);
     * - 값1이 NULL이 아니면 값1을 반환하고, NULL이면 값2를 반환한다.
     */
    const sql = `
    SELECT user_table.*, COALESCE(file_table.file_path, '/public/image/profile/default.jpg') AS file_path
    FROM user_table
    LEFT JOIN file_table ON user_table.file_id = file_table.file_id
    WHERE user_table.user_id = ${userId} AND user_table.deleted_at IS NULL;
    `;
    const userData = await dbConnect.query(sql, response);

    const results = {
        userId: userData[0].user_id,
        email: userData[0].email,
        nickname: userData[0].nickname,
        profile_image: userData[0].file_path,
        created_at: userData[0].created_at,
        updated_at: userData[0].updated_at,
        deleted_at: userData[0].deleted_at,
    };
    return results;
};

// 회원정보 수정
export const updateUser = async (requestData, response) => {
    const { userId, nickname, profileImagePath } = requestData;
    console.log(profileImagePath);
    const updateUserSql = `
    UPDATE user_table
    SET nickname = ${nickname}
    WHERE user_id = ${userId} AND deleted_at IS NULL;
    `;
    const updateUserResults = await dbConnect.query(updateUserSql, response);

    if (!updateUserResults) return null;

    if (profileImagePath === undefined) return updateUserResults;

    const profileImageSql = `
    INSERT INTO file_table
    (user_id, file_path, file_category)
    VALUES (${userId}, ${profileImagePath}, 1);
    `;
    const profileImageResults = await dbConnect.query(
        profileImageSql,
        response,
    );

    const userProfileSql = `
    UPDATE user_table
    SET file_id = ${profileImageResults.insertId}
    WHERE user_id = ${userId} AND deleted_at IS NULL;
    `;
    const userProfileResults = await dbConnect.query(userProfileSql, response);

    return userProfileResults;
};

// 비밀번호 변경
export const changePassword = async (requestData, response) => {
    const { userId, password } = requestData;

    const sql = `
    UPDATE user_table
    SET password = ${password}
    WHERE user_id = ${userId};
    `;
    const results = await dbConnect.query(sql, response);

    if (!results) return null;

    return results;
};

// 회원탈퇴
export const softDeleteUser = async (requestData, response) => {
    const { userId } = requestData;
    let sql = `SELECT * FROM user_table WHERE user_id = ${userId} AND deleted_at IS NULL;`;
    let results = await dbConnect.query(sql, response);

    if (!results) return null;

    sql = `UPDATE user_table SET deleted_at = now() WHERE user_id = ${userId};`;
    results = await dbConnect.query(sql, response);

    return results[0];
};

export const checkEmail = async (requestData, response) => {
    const { email } = requestData;

    const sql = `SELECT email FROM user_table WHERE email = ${email};`;
    const results = await dbConnect.query(sql, response);

    if (!results || results.length === 0) return null;

    return results;
};

export const checkNickname = async (requestData, response) => {
    const { nickname } = requestData;

    const sql = `SELECT nickname FROM user_table WHERE nickname = ${nickname};`;
    const results = await dbConnect.query(sql, response);

    if (!results || results.length === 0) return null;

    return results;
};
export const updateUserSession = async (requestData, response) => {
    const { userId, session } = requestData;

    const sql = `
    UPDATE user_table
    SET session_id = ${session}
    WHERE user_id = ${userId};
    `;
    const results = await dbConnect.query(sql, response);

    if (!results) return null;

    return results;
};

export const destroyUserSession = async (requestData, response) => {
    const { userId } = requestData;

    const sql = `
    UPDATE user_table
    SET session_id = NULL
    WHERE user_id = ${userId} AND session_id IS NOT NULL;
    `;

    const results = await dbConnect.query(sql, response);

    if (!results) {
        return null;
    }

    return results;
};