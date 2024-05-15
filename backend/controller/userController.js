import mysql from 'mysql2';
import * as userModel from '../model/userModel.js';
import { validEmail, validNickname, validPassword } from '../util/validUtil.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// 회원가입
export const signupUser = async (request, response) => {
    try {
        if (request.body.profileImagePath === undefined)
            request.body.profileImagePath = null;

        const emailValid = validEmail(request.body.email);
        const nicknameValid = validNickname(request.body.nickname);
        const passwordValid = validPassword(request.body.password);

        if (!request.body.email || !emailValid)
            return response.status(400).json({
                status: 400,
                message: 'invalid_email',
                data: null,
            });
        if (!request.body.nickname || !nicknameValid)
            return response.status(400).json({
                status: 400,
                message: 'invalid_nickname',
                data: null,
            });
        if (!request.body.password || !passwordValid)
            return response.status(400).json({
                status: 400,
                message: 'invalid_password',
                data: null,
            });

        const { email, password, nickname, profileImagePath } = request.body;

        // bcrypt 암호화
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const reqSignupData = {
            email: mysql.escape(email),
            password: mysql.escape(hashedPassword),
            nickname: mysql.escape(nickname),
            profileImagePath:
                profileImagePath === null
                    ? null
                    : mysql.escape(profileImagePath),
        };
        const resSignupData = await userModel.signUpUser(
            reqSignupData,
            response,
        );

        if (profileImagePath !== null) {
            const reqProfileImageData = {
                userId: resSignupData,
                profileImagePath: mysql.escape(profileImagePath),
            };

            const resProfileImageData = await userModel.uploadProfileImage(
                reqProfileImageData,
                response,
            );
            reqSignupData.file_id = resProfileImageData.insertId;
        }

        return response.status(201).json({
            status: 201,
            message: 'register_success',
            data: {
                userId: resSignupData.insertId,
                profile_image_id: reqSignupData.file_id,
            },
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};

// 프로필 사진 업로드
export const uploadProfileImage = async (request, response) => {
    try {
        if (request.body.profileImage === undefined)
            return response.status(400).json({
                status: 400,
                message: 'invalid_profile_image',
                data: null,
            });
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });

        const userId = request.params.user_id;
        const { profileImage } = request.body;

        const requestData = {
            userId: mysql.escape(userId),
            profileImage: mysql.escape(profileImage),
        };

        const resData = await userModel.uploadProfileImage(
            requestData,
            response,
        );

        if (resData === null)
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });

        return response.status(204).end();
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};

export const loginUser = async (request, response) => {
    try {
        const { email, password } = request.body;

        const requestData = {
            email: mysql.escape(email),
            password: mysql.escape(password),
        };

        const responseData = await userModel.loginUser(requestData, response);

        if (!responseData || responseData === null)
            return response.status(401).json({
                status: 401,
                message: 'login_failed',
                data: null,
            });

        responseData.sessionId = request.sessionID;
        //console.log(responseData.sessionId)
        const requestSessionData = {
            session: mysql.escape(responseData.sessionId),
            userId: mysql.escape(responseData.user_id),
        };
        await userModel.updateUserSession(requestSessionData, response);

        return response.status(200).json({
            status: 200,
            message: 'login_success',
            data: responseData,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 유저 정보 가져오기
export const getUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });
        const userId = request.params.user_id;

        const requestData = {
            userId: mysql.escape(userId),
        };
        const resData = await userModel.getUser(requestData, response);

        if (resData === null)
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });

        return response.status(200).json(resData);
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};

// 회원정보 수정
export const updateUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });
        if (!request.body.nickname)
            return response.status(400).json({
                status: 400,
                message: 'invalid_nickname',
                data: null,
            });

        const userId = request.params.user_id;
        const { nickname, profileImagePath } = request.body;
        console.log(profileImagePath);

        const requestData = {
            userId: mysql.escape(userId),
            nickname: mysql.escape(nickname),
        };
        if (profileImagePath !== undefined)
            requestData.profileImagePath = mysql.escape(profileImagePath);

        const resData = await userModel.updateUser(requestData, response);

        if (resData === null)
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });

        return response.status(201).json({
            status: 201,
            message: 'update_user_data_success',
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};

// 비밀번호 변경
export const changePassword = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });

        const userId = request.params.user_id;
        const { password } = request.body;

        // 8자 이상, 특수문자 포함
        const passwordRegex =
            /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;

        if (!password || !passwordRegex.test(password)) {
            return response.status(400).json({
                status: 400,
                message: 'invalid_password',
                data: null,
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const requestData = {
            userId: mysql.escape(userId),
            password: mysql.escape(hashedPassword),
        };

        const resData = await userModel.changePassword(requestData, response);
        if (resData === null) {
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });
        }

        return response.status(201).json({
            status: 201,
            message: 'change_user_password_success',
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};
// 회원탈퇴
export const softDeleteUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });

        const userId = request.params.user_id;

        const requestData = {
            userId: mysql.escape(userId),
        };
        const resData = await userModel.softDeleteUser(requestData, response);

        if (resData === null)
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'delete_user_data_success',
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};

// 로그인 상태 체크
export const checkAuth = async (request, response) => {
    try {
		    // query -> headers
        const userId = request.headers.userid;

        const requestData = {
            userId: mysql.escape(userId),
        };

        const userData = await userModel.getUser(requestData, response);

        if (userData === null)
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });

        console.log(userData);

        if (parseInt(userData.userId, 10) !== parseInt(userId, 10))
            //console.log(`response.status >> ${response.status}`)
            return response.status(401).json({
                status: 401,
                message: 'required_authorization',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: null,
            data: {
                userId,
                email: userData.email,
                nickname: userData.nickname,
                profileImagePath: userData.profile_image,
                auth_token: userData.session_id,
                auth_status: true,
            },
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};


// 로그아웃
export const logoutUser = async (request, response) => {
    try {
		    // query -> headers
        const { userId } = request.headers;

        return response.status(204).end();
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};

export const checkEmail = async (request, response) => {
    const { email } = request.query;

    const requestData = {
        email: mysql.escape(email),
    };

    const resData = await userModel.checkEmail(requestData, response);

    if (resData === null)
        return response.status(200).json({
            status: 200,
            message: 'available_email',
            data: null,
        });

    return response.status(400).json({
        status: 400,
        message: 'already_exist_email',
        data: null,
    });
};

// 닉네임 체크
export const checkNickname = async (request, response) => {
    const { nickname } = request.query;

    const requestData = {
        nickname: mysql.escape(nickname),
    };

    const resData = await userModel.checkNickname(requestData, response);

    if (resData === null)
        return response.status(200).json({
            status: 200,
            message: 'available_nickname',
            data: null,
        });

    return response.status(400).json({
        status: 400,
        message: 'already_exist_nickname',
        data: null,
    });
};
