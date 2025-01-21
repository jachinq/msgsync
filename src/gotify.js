import cookie from './cookie'
import { isLocalhost } from './util';
const { getCookie, setCookie } = cookie;

class GotifyConfig {
  constructor() {
    let isLocal = isLocalhost(window.location.href);
    // console.log("isLocalhost", isLocal);
    const defaultConfig = {
        url: isLocal ? '' : '',
        token: ''
    };
    
    this.url = getCookie('gotifyUrl') || defaultConfig.url;
    this.token = getCookie('gotifyToken') || defaultConfig.token;
  }
  setUrl(url) {
    this.url = url;
    setCookie('gotifyUrl', url);
  }
  setToken(token) {
    this.token = token;
    setCookie('gotifyToken', token);
  }
  getUrl() {
    return this.url;
  }
  getToken() {
    return this.token;
  }

  async sendMsg({ date, content }) {
    try {
      let url = this.getUrl();
      const token = this.getToken();
      const data = {
        message: content,
        title: 'MsgSync:' + date,
      };
      if (url && token) {
        if (url.endsWith('/')) {
          url = url.slice(0, -1);
        }
        if (url.endsWith('/message')) {
          url = url.slice(0, -8);
        }
        // console.log(url + '/message?token=' + token);
        const response = await fetch(url + '/message?token=' + token, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          if (this.url && this.token) {
            messageBox.show({ type: 'error', message: '推送到 gotify 失败' })
          }
        }
        
        return response.ok;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}


export default GotifyConfig;