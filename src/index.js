import './css/index.css';
import './css/comm.css';
import Webdav from './webdavutils';
import messageBox from './messageBox';
import GotifyConfig from "./gotify";

// 加载字体
window.onload = function () {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://chinese-fonts-cdn.deno.dev/packages/lywkpmydb/dist/LXGWWenKaiScreen/result.css';
  document.head.appendChild(link);
};

const webdav = new Webdav();
class App {
  constructor() {
    this.init();
  }

  init() {
    this.initEvent();
  }

  initEvent() {
    const sendBtn = document.querySelector('#send-btn');
    sendBtn.addEventListener('click', this.sendMsg);
  }

  sendMsg = async () => {
    if (this.client == null) {
      console.log("client is null", client);
      messageBox.show({ type: 'error', message: '请先配置服务器信息' })
      return;
    }

    const textMsg = document.querySelector('#text-msg');
    const content = textMsg.value;
    if (content.length === 0) {
      messageBox.show({ type: 'error', message: '消息不能为空' });
      return;
    }
    const date = new Date().toLocaleString();
    const data = {
      date,
      content
    }
    const result = await Webdav.saveData(client, data);
    // console.log(result);
    this.refreshData();
    textMsg.value = '';
    if (result) {
      messageBox.show({ type: 'info', message: '发送成功' });
      const gotifyConfig = new GotifyConfig();
      const ok = await new GotifyConfig().sendMsg({ date, content });
      if (gotifyConfig.getToken() && gotifyConfig.getUrl() && ok !== true) {
        messageBox.show({ type: 'error', message: '推送到 gotify 失败' })
      }
    } else {
      messageBox.show({ type: 'error', message: '发送失败' })
    }

  }

  // 刷新数据，页面首次打开时调用，以及保存数据时调用
  refreshData = async () => {
    const page = 1;
    const num = 100;
    const cards = await webdav.getData(page, num);
    this.renderCards(cards);
    Array.from(document.getElementsByClassName("img-tag")).forEach(function (img) {
      img.addEventListener('click', () => {
        const imgUrl = img.src;
        window.open(imgUrl, '_blank');
        console.log('open img', imgUrl);
      });
    });
  }

  // 生成卡片头
  createCardHeader = ({ date = '', content = '' }) => {
    const header = document.createElement('div');
    header.classList.add('card-header');

    if (date && date.length > 0) {
      const dateDiv = document.createElement('div');
      dateDiv.classList.add('card-date');
      dateDiv.textContent = date;
      header.appendChild(dateDiv);
    }

    // if (title && title.length > 0) {
    //   const titleDiv = document.createElement('div');
    //   titleDiv.classList.add('card-title');
    //   titleDiv.textContent = title;
    //   header.appendChild(titleDiv);
    // }

    const optDiv = document.createElement('div');
    optDiv.classList.add('card-opt');

    // del btn
    const delBtn = document.createElement('button');
    delBtn.id = `del-btn${Math.floor(Math.random() * 1000000)}`;
    delBtn.classList.add('card-del-btn');
    delBtn.textContent = '删除';
    optDiv.appendChild(delBtn);
    delBtn.addEventListener('click', () => {

      const confirm = window.confirm('确认删除该条消息吗？');
      if (!confirm) {
        return;
      }

      // delete data from webdav server
      const data = {
        date, content
      }
      Webdav.deleteData(client, data).then(res => {
        if (res) {
          messageBox.show({ type: 'info', message: '删除成功' })
          refreshData();
        } else {
          messageBox.show({ type: 'error', message: '删除失败' })
        }
      })
    });

    if (content && content.length > 0) {
      const copyBtn = document.createElement('button');
      copyBtn.id = `copy-btn${Math.floor(Math.random() * 1000000)}`;
      copyBtn.classList.add('card-copy-btn');
      copyBtn.textContent = '复制';
      optDiv.appendChild(copyBtn);
      copyBtn.addEventListener('click', () => {
        // copy content to clipboard
        const el = document.createElement('textarea');
        el.value = content;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      });
    }
    header.appendChild(optDiv);
    return header;
  };

  // 生成卡片内容
  createCardContent = ({ content = '' }) => {
    // 通过正则匹配出 content 中的链接, 将其替换为 a 标签
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('card-content');
    contentDiv.classList.add('break-words');

    contentDiv.textContent = content;

    const links = content.match(/https?:\/\/[^\s]+/g);
    const imgs = content.match(/!\[[^\]]*\]\(([^\)]+)\)/g);

    if (links && links.length > 0) {
      links.forEach(link => {
        // console.log(imgs, link);
        if (imgs) {
          imgs.forEach(img => { // 处理图片链接
            if (img.includes(link)) {
              console.log('ignore img link', link);
              return;
            }
          });
          console.log('ignore img link', link);
          return;
        }
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.textContent = link;
        contentDiv.innerHTML = contentDiv.innerHTML.replace(link, a.outerHTML);
      });
    }

    // 检测代码块
    const codeBlocks = content.match(/```[\s\S]*?```/g);
    if (codeBlocks && codeBlocks.length > 0) {
      codeBlocks.forEach(codeBlock => {
        console.log(codeBlock);
        const pre = document.createElement('div');
        pre.classList.add('code-block');
        // codeBlock 按行处理
        const lines = codeBlock.split('\n');
        lines.forEach(line => {
          if (line.startsWith('```')) {
            return;
          }
          if (line.trim().length === 0) {
            return;
          }
          const code = document.createElement('div');
          code.textContent = line;
          pre.appendChild(code);
        });
        // pre.textContent = codeBlock;
        contentDiv.innerHTML = contentDiv.innerHTML.replace(codeBlock, pre.outerHTML);
      });
    }


    // 把所有的换行符替换为 <br>
    contentDiv.innerHTML = contentDiv.innerHTML.replace(/\n/g, '<br>');

    // 检测图片链接
    if (imgs && imgs.length > 0) {
      imgs.forEach(img => {
        // console.log(img);
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img-block');
        const imgTag = document.createElement('img');
        imgTag.classList.add('img-tag');
        const imgUrl = img.match(/\(([^\)]+)\)/)[1];
        imgTag.src = imgUrl;
        imgDiv.appendChild(imgTag);
        contentDiv.innerHTML = contentDiv.innerHTML.replace(img, imgDiv.outerHTML);
      });
    }

    return contentDiv;
  }

  // 根据数据list渲染卡片
  renderCards = (cards) => {
    const root = document.querySelector('#root');
    if (cards.length === 0) {
      root.innerHTML = '<div class="no-data">无数据</div>';
      return;
    }
    // Clear root
    root.innerHTML = '';
    const cardsClone = [...cards];
    cardsClone.reverse();
    // Render cards
    cardsClone.forEach(data => {
      const card = document.createElement('div');
      card.classList.add('card');
      // const contentDiv = document.createElement('div');
      // contentDiv.classList.add('card-content');
      // contentDiv.classList.add('break-words');
      // contentDiv.appendChild(createCardContent(data));

      card.appendChild(this.createCardHeader(data));
      card.appendChild(this.createCardContent(data));

      root.appendChild(card);
    });
  }
}

const app = new App();
app.refreshData();