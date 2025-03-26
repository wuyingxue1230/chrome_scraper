// 获取DOM元素
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

// 更新状态显示
function updateStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = isError ? 'error' : 'success';
}

// 保存链接到飞书多维表格
async function saveCurrentTab() {
  try {
    // 禁用按钮，显示加载状态
    saveButton.disabled = true;
    updateStatus('正在处理...');

    // 获取当前标签页信息
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const { url, title } = tab;

    // 发送消息给background script处理保存操作
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_LINK',
      data: { url, title }
    });

    if (response.success) {
      updateStatus('保存成功！');
      setTimeout(() => window.close(), 1500);
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    updateStatus(error.message || '保存失败，请重试', true);
  } finally {
    saveButton.disabled = false;
  }
}

// 绑定点击事件
saveButton.addEventListener('click', saveCurrentTab);