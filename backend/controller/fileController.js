export const uploadFile = (request, response) => {
    if (!request.file)
        response.status(400).send({
            status: 400,
            message: 'invalid_file',
            data: null,
        });

    response.status(201).send({
        status: 201,
        message: 'file_upload_success',
        data: {
            filePath: `/public/image/profile/${request.file.filename}`,
        },
    });
};

export const uploadPostFile = (request, response) => {
    if (!request.file)
        response.status(400).send({
            status: 400,
            message: 'invalid_file',
            data: null,
        });

    response.status(201).send({
        status: 201,
        message: 'file_upload_success',
        data: {
            filePath: `/public/image/post/${request.file.filename}`,
        },
    });
};
