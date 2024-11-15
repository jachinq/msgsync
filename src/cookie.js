function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');  // 以分号分割 cookies
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);  // 去除前导空格
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);  // 找到 cookie 并返回其值
    }
    return null;  // 未找到返回 null
}
function setCookie(name, value, days=-1) {
    let expires = "";
    if (days === null || days === undefined || days <= 0) {
        expires = "; expires=Fri, 31 Dec 9999 23:59:59 GMT";  // 设置一个永不过期的时间
    } else {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));  // 转换为毫秒
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export default {
    getCookie,
    setCookie
}