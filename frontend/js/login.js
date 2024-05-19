import Header from '../components/header/header.js';
import {
    authCheckReverse,
    prependChild,
    setCookie,
    validEmail,
} from '../utils/function.js';
import { userLogin } from '../api/loginRequest.js';

const HTTP_OK = 200;
const MAX_PASSWORD_LENGTH = 8;

const loginData = {
    id: '',
    password: '',
};

const updateHelperText = (helperTextElement, message = '') => {
    helperTextElement.textContent = message;
};

const loginClick = async () => {
    const { id: email, password } = loginData;
    const helperTextElement = document.querySelector('.helperText');

    const response = await userLogin(email, password);
    //console.log("login.js에서 loginClick 함수의 response >> " + response)
    if (!response.ok) {
        updateHelperText(
            helperTextElement,
            '*입력하신 계정 정보가 정확하지 않았습니다.',
        );
        return;
    }

    const result = await response.json();
    //console.log("login.js에서 loginClick 함수의 result >> " + result)
    if (result.status !== HTTP_OK) {
        updateHelperText(
            helperTextElement,
            '*입력하신 계정 정보가 정확하지 않았습니다.',
        );
        return;
    }
    updateHelperText(helperTextElement);
    //console.log("login.js에서 loginClick 함수의 auth_token >> " + result.data.sessionId)
    //console.log("login.js에서 loginClick 함수의 userId >> " + result.data.userId)
    setCookie('session', result.data.sessionId, 14);
    setCookie('userId', result.data.userId, 14);
    location.href = '/html/index.html';
};

const observeSignupData = () => {
    const { id: email, password } = loginData;
    const button = document.querySelector('#login');
    const helperTextElement = document.querySelector('.helperText');

    const isValidEmail = validEmail(email);
    updateHelperText(
        helperTextElement,
        isValidEmail || !email
            ? ''
            : '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
    );

    button.disabled = !(
        email &&
        isValidEmail &&
        password &&
        password.length >= MAX_PASSWORD_LENGTH
    );
    button.style.backgroundColor = button.disabled ? 'rgb(110, 160, 0)' : 'rgb(175, 255, 2)';
};

const eventSet = () => {
    document.getElementById('login').addEventListener('click', loginClick);

    document.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            loginClick();
        }
    });

    ['id', 'pw'].forEach(field => {
        const inputElement = document.getElementById(field);
        inputElement.addEventListener('input', event =>
            onChangeHandler(event, field === 'id' ? 'id' : 'password'),
        );

        if (field === 'id') {
            inputElement.addEventListener('focusout', event =>
                lottieAnimation(validEmail(event.target.value) ? 1 : 2),
            );
        }
    });

    document
        .getElementById('id')
        .addEventListener('input', event => validateEmail(event.target));
};

const onChangeHandler = (event, uid) => {
    loginData[uid] = event.target.value;
    observeSignupData();
};

const validateEmail = input => {
    const regex = /^[A-Za-z0-9@.]+$/;
    if (!regex.test(input.value)) input.value = input.value.slice(0, -1);
};

let lottieInstance = null;
const lottieAnimation = type => {
    const container = document.getElementById('lottie-animation');
    const animationPaths = [
        '/public/check_anim.json',
        '/public/denied_anim.json',
    ];
    if (lottieInstance) lottieInstance.destroy();
    container.innerHTML = '';
    lottieInstance = window.lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: animationPaths[type - 1],
    });
};

const init = async () => {
    await authCheckReverse();
    observeSignupData();
    prependChild(document.body, Header('모두의 숲속 이야기', 0));
    eventSet();
    localStorage.clear();
    document.cookie = '';
};

init();