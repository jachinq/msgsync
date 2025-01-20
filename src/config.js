import "./css/comm.css";
import "./css/config.css";
import webdavutils from './webdavutils';
import messageBox from './messageBox';
import cookie from './cookie'
import GotifyConfig from "./gotify";


const { getCookie, setCookie } = cookie;

const parseConfig = () => {
    const url = document.querySelector('#server').value;
    const user = document.querySelector('#user').value;
    const pwd = document.querySelector('#secret').value;
    if (url == null || url == undefined || url.trim() == '') {
        messageBox.show({ type: 'error', message: '请填写服务器地址' })
        return;
    }
    if (user == null || user == undefined || user.trim() == '') {
        messageBox.show({ type: 'error', message: '请填写用户名' })
        return;
    }
    if (pwd == null || pwd == undefined || pwd.trim() == '') {
        messageBox.show({ type: 'error', message: '请填写密码' })
        return;
    }
    const configData = {
        url, user, pwd
    };
    return configData;
}

const connectBtn = document.querySelector('#config-connect');
const saveBtn = document.querySelector('#config-save');
connectBtn.addEventListener('click', async () => {
    const configData = parseConfig();
    if (!configData) {
        return;
    }
    const client = webdavutils.buildClient(configData)
    if (!client) {
        messageBox.show({ type: 'error', message: '连接失败' })
        return;
    }
    try {
        const result = await webdavutils.testConnection(client);
        console.log("test connection result", result);
        if (result) {
            // alert('连接成功');
            messageBox.show({ type: 'info', message: '连接成功' })
        } else {
            messageBox.show({ type: 'error', message: '连接失败' })
        }
    } catch (error) {
        console.error(error);
        messageBox.show({ type: 'error', message: '连接失败' })
    }
});
saveBtn.addEventListener('click', async () => {
    const configData = parseConfig();
    if (!configData) {
        return;
    }
    // setConfigData(configData);
    setCookie('webdavUrl', configData.url);
    setCookie('webdavUsername', configData.user);
    setCookie('webdavPassword', configData.pwd);
    messageBox.show({ type: 'info', message: '保存成功' })
});

// 从 cookie 中获取配置信息，回填到表单上
const webdavUrl = getCookie('webdavUrl');
const webdavUsername = getCookie('webdavUsername');
const webdavPassword = getCookie('webdavPassword');
// console.log("configData", configData);
if (webdavUrl) {
    document.querySelector('#server').value = webdavUrl;
}
if (webdavUsername) {
    document.querySelector('#user').value = webdavUsername;
}
if (webdavPassword) {
    document.querySelector('#secret').value = webdavPassword;
}


const gotifyConfig = new GotifyConfig();
if (gotifyConfig.url) {
    document.querySelector('#gotify-server').value = gotifyConfig.url;
}
if (gotifyConfig.token) {
    document.querySelector('#gotify-token').value = gotifyConfig.token;
}
document.querySelector('#gotify-save')?.addEventListener('click', () => {
    const url = document.querySelector('#gotify-server').value;
    const token = document.querySelector('#gotify-token').value;
    if (url == null || url == undefined || url.trim() == '') {
        messageBox.show({ type: 'error', message: '请填写 Gotify 服务器地址' })
        return;
    }
    if (token == null || token == undefined || token.trim() == '') {
        messageBox.show({ type: 'error', message: '请填写 Gotify 令牌' })
        return;
    }
    gotifyConfig.setUrl(url);
    gotifyConfig.setToken(token);
    messageBox.show({ type: 'info', message: '保存成功' })
});
