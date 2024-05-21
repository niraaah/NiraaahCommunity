import { getServerUrl, getCookie } from '../utils/function.js';

export const getPosts = (offset, limit, sortBy = 'dateDesc') => {
    const url = `${getServerUrl()}/posts?offset=${offset}&limit=${limit}&sortBy=${sortBy}`;
    console.log("Fetching posts from URL:", url); // 로그 추가
    const result = fetch(url, {
        headers: {
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
        noCORS: true,
    });
    return result;
};
