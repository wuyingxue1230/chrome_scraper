// 飞书API配置
const FEISHU_CONFIG = {
  APP_ID: 'xxxx',
  APP_SECRET: 'xxxx',
  BASE_ID: 'xxxx',
  TABLE_ID: 'xxxx'
};

// 获取飞书访问令牌
async function getFeishuToken() {
  try {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: FEISHU_CONFIG.APP_ID,
        app_secret: FEISHU_CONFIG.APP_SECRET
      })
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(data.msg);
    }

    return data.tenant_access_token;
  } catch (error) {
    console.error('获取飞书Token失败:', error);
    throw new Error('获取授权失败');
  }
}

// 保存链接到飞书多维表格
async function saveToFeishu(url, title) {
  try {
    const token = await getFeishuToken();
    
    const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.BASE_ID}/tables/${FEISHU_CONFIG.TABLE_ID}/records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          '链接': {
            text: title || url,
            link: url
          }
        }
      })
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(data.msg);
    }

    return true;
  } catch (error) {
    console.error('保存到飞书失败:', error);
    throw error;
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_LINK') {
    const { url, title } = message.data;
    
    saveToFeishu(url, title)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // 表示会异步发送响应
  }
});
