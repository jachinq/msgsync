import { createClient } from "webdav";

const file_path = "/msgpush.json";

const buildClient = ({url, user, pwd}) => {
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

export default {
    buildClient,
    testConnection,
    saveData,
    deleteData,
    readData
}