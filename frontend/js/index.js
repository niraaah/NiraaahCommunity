import BoardItem from '../components/board/boardItem.js';
import Header from '../components/header/header.js';
import { authCheck, getServerUrl, prependChild } from '../utils/function.js';
import { getPosts } from '../api/indexRequest.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';
const HTTP_NOT_AUTHORIZED = 401;
const SCROLL_THRESHOLD = 0.9;
const INITIAL_OFFSET = 0;
const ITEMS_PER_LOAD = 5;

let currentSortBy = 'dateDesc'; // 초기 정렬 기준을 설정합니다.
let offset = INITIAL_OFFSET;
let isEnd = false;
let isProcessing = false;

const getBoardItem = async (offset = 0, limit = 5, sortBy = 'dateDesc') => {
    console.log("BoardItem 불러오는 중...", { offset, limit, sortBy });
    const response = await getPosts(offset, limit, sortBy);
    if (!response.ok) {
        throw new Error('Failed to load post list.');
    }

    const data = await response.json();
    console.log("Fetched data:", data); // 로그 추가
    return data.data;
};

const setBoardItem = (boardData, clear = false) => {
    const boardList = document.querySelector('.boardList');
    if (clear) {
        boardList.innerHTML = ''; // 이전 데이터를 지웁니다.
    }
    if (boardList && boardData) {
        console.log("Setting board items:", boardData); // 로그 추가
        const itemsHtml = boardData
            .map(data =>
                BoardItem(
                    data.post_id,
                    data.created_at,
                    data.post_title,
                    data.hits,
                    data.profileImagePath,
                    data.nickname,
                    data.comment_count,
                    data.like,
                ),
            )
            .join('');
        console.log("Generated HTML:", itemsHtml); // 로그 추가
        boardList.innerHTML += itemsHtml;
    } else {
        console.error("Failed to set board items: boardList or boardData is null.");
    }
};

const addInfinityScrollEvent = () => {
    window.addEventListener('scroll', async () => {
        const hasScrolledToThreshold =
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight * SCROLL_THRESHOLD;
        if (hasScrolledToThreshold && !isProcessing && !isEnd) {
            isProcessing = true;

            try {
                const newItems = await getBoardItem(offset, ITEMS_PER_LOAD, currentSortBy);
                if (!newItems || newItems.length === 0) {
                    isEnd = true;
                } else {
                    offset += ITEMS_PER_LOAD;
                    setBoardItem(newItems);
                }
            } catch (error) {
                console.error('Error fetching new items:', error);
                isEnd = true;
            } finally {
                isProcessing = false;
            }
        }
    });
};

const handleSortChange = async (event) => {
    currentSortBy = event.target.value;
    offset = INITIAL_OFFSET;
    isEnd = false;
    isProcessing = false;
    console.log("Sorting by:", currentSortBy); // 로그 추가
    try {
        const sortedData = await getBoardItem(offset, ITEMS_PER_LOAD, currentSortBy);
        console.log("Sorted data:", sortedData); // 로그 추가
        setBoardItem(sortedData, true); // Clear previous items and set new sorted items
    } catch (error) {
        console.error('Error fetching sorted items:', error);
    }
};

const init = async () => {
    try {
        const data = await authCheck();
        if (data.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
            return;
        }

        const profileImagePath =
            data.data.profileImagePath ?? DEFAULT_PROFILE_IMAGE;
        const fullProfileImagePath = `${getServerUrl()}${profileImagePath}`;
        prependChild(
            document.body,
            Header('모두의 숲속 이야기', 0, fullProfileImagePath),
        );

        const boardList = await getBoardItem(0, ITEMS_PER_LOAD, currentSortBy);
        setBoardItem(boardList);

        const sortByElement = document.getElementById('sort-by');
        if (sortByElement) {
            sortByElement.addEventListener('change', handleSortChange);
        }

        addInfinityScrollEvent();
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

init();
