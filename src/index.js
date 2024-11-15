import './css/index.css';
import './css/comm.css';
import webdavutils from './webdavutils';
import cookie from './cookie'
import messageBox from './messageBox';

const { getCookie } = cookie;

// 从 cookie 中获取配置信息
const config = {
  url: getCookie('webdavUrl') || '',
  user: getCookie('webdavUsername') || '',
  pwd: getCookie('webdavPassword') || ''
};
const client = webdavutils.buildClient(config);
// console.log(config, client);


const root = document.querySelector('#root');
const sendBtn = document.querySelector('#send-btn');

// 生成卡片头
const createCardHeader = ({ date = '', content = '' }) => {
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
    webdavutils.deleteData(client, data).then(res => {
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
const createCardContent = ({ date = '', content = '' }) => {
  const card = document.createElement('div');
  card.classList.add('card');
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('card-content');
  const contentSpan = document.createElement('span');
  contentSpan.classList.add('card-content-span');
  contentSpan.textContent = content;
  contentDiv.appendChild(contentSpan);

  card.appendChild(createCardHeader({ date, content }));

  card.appendChild(contentDiv);
  return card;
}
// 根据数据list渲染卡片
const renderCards = (cards) => {
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
    // root.appendChild(createCardHeader(data));
    root.appendChild(createCardContent(data));
  });
}
// 从webdav服务器获取数据
const getData = async (page, num) => {
  let start = (page - 1) * num;
  let end = start + num;
  // Generate 10 cards
  let datas = [];
  if (client) {
    datas = await webdavutils.readData(client);
  }
  console.log(datas);
  if (datas == null) {
    return [];
  }
  // return datas.slice(start, end);
  return datas;
}
// 刷新数据，页面首次打开时调用，以及保存数据时调用
const refreshData = async () => {
  const page = 1;
  const num = 100;
  const cards = await getData(page, num);
  renderCards(cards);
}

sendBtn.addEventListener('click', async () => {
  if (client == null) {
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
  const result = await webdavutils.saveData(client, data);
  // console.log(result);
  refreshData();
  textMsg.value = '';
  if (result) {
    messageBox.show({ type: 'info', message: '发送成功' })
  } else {
    messageBox.show({ type: 'error', message: '发送失败' })
  }

});

refreshData();


