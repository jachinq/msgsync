import { createClient } from "webdav";
import cookie from './cookie'

const file_path = "/msgpush.json";

const buildClient = ({ url, user, pwd }) => {
    if (url == null || url == undefined || url == "") {
        console.log("url is null or undefined");
        return null;
    }
    if (user == null || user == undefined || user == "") {
        console.log("user is null or undefined");
        return null;
    }
    if (pwd == null || pwd == undefined || pwd == "") {
        console.log("pwd is null or undefined");
        return null;
    }
    const client = createClient(url, {
        username: user,
        password: pwd
    });
    return client;
}

// console.log(createClient)
// const client = createClient(url,
//     {
//         username: "jachin",
//         password: "176866"
//     }
// );

// Get directory contents
// const directoryItems = await client.getDirectoryContents("/");
// console.log(directoryItems);


// test connection
const testConnection = async (client) => {
    if (client == null || client == undefined) {
        console.log("client is null or undefined");
        return false;
    }
    return await client.exists("/");
};

const readData = async (client) => {
    const exist = await client.exists(file_path);
    if (exist) {
        const contents = await client.getFileContents(file_path);
        // console.log('contents', contents);
        // 使用 TextDecoder 转换为字符串
        const decoder = new TextDecoder('utf-8');
        let string = decoder.decode(contents);
        if (string == null || string == undefined || string == "") {
            string = "[]";
        }
        const json = JSON.parse(string);
        // console.log(json);
        return json;
    }
}


const saveData = async (client, data) => {
    if (data == null || data == undefined || data == "") {
        console.log("no data to save");
        return;
    }

    // if (await client.exists(file_path) == false) {
    //     await client.createFile(file_path, JSON.stringify([]));
    // }

    const datas = await readData(client);
    datas.push(data);
    let ok = await client.putFileContents(file_path, JSON.stringify(datas));
    // console.log(ok);
    return ok;
}

const deleteData = async (client, data) => {
    if (data == null || data == undefined || data == "") {
        console.log("no data to save");
        return;
    }
    const datas = await readData(client);

    const index = datas.findIndex(item => {
        // console.log('find index', item, data);
        return item.date === data.date && item.content === data.content
    });

    if (index > -1) {
        datas.splice(index, 1);
    } else {
        console.log('no data to delete', data);
        return false;
    }
    let ok = await client.putFileContents(file_path, JSON.stringify(datas));
    // console.log(ok);
    return ok;
}

const { getCookie } = cookie;

class WebDavUtils {
    constructor() {
        // 从 cookie 中获取配置信息
        const config = {
            url: getCookie('webdavUrl') || '',
            user: getCookie('webdavUsername') || '',
            pwd: getCookie('webdavPassword') || ''
        };
        this.client = buildClient(config);
    }

    async testConnection() {
        return await testConnection(this.client);
    }

    async readData() {
        return await readData(this.client);
    }

    async saveData(data) {
        return await saveData(this.client, data);
    }

    async deleteData(data) {
        return await deleteData(this.client, data);
    }

    // 从webdav服务器获取数据
    getData = async (page, num) => {
        let start = (page - 1) * num;
        let end = start + num;
        // Generate 10 cards
        let datas = [];
        if (this.client) {
            datas = await this.readData(this.client);
        }
        // console.log(datas);
        if (datas == null) {
            return [];
        }
        // return datas.slice(start, end);
        return datas;
    }

}
export default WebDavUtils;