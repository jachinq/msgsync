import './css/messagebox.css';

const messageBox = {
    show: function ({ type='info', message='' }) {
        const messageBox = document.createElement("div");
        messageBox.classList.add("message-box");
        if (type === 'error') { 
            messageBox.classList.add('error');
        }
        messageBox.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(messageBox);
        setTimeout(() => {
            // messageBox.classList.remove('active');
            document.body.removeChild(messageBox);
        }, 3000); // 3秒后自动关闭提示框
    }
};

export default messageBox;