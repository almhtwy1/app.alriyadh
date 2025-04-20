/**
 * إضافة الأنماط الخاصة بواجهة المستخدم
 */

function addGlobalStyles() {
  GM_addStyle(`
    .ct-container {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      width: 400px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      overflow: auto;
      transition: all .3s ease;
      direction: rtl;
      text-align: right;
    }
    .ct-minimized-icon {
      position: fixed;
      bottom: 20px;
      right: 20px;
      font-size: 20px;
      color: #000;
      cursor: pointer;
      z-index: 999999;
    }
    .ct-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .ct-title {
      margin: 0;
      color: #2c3e50;
      text-align: center;
      flex-grow: 1;
    }
    .ct-minimize-btn {
      background: none;
      border: none;
      color: #777;
      cursor: pointer;
      font-size: 16px;
      padding: 0 8px;
      transition: color .3s;
    }
    .ct-minimize-btn:hover {
      color: #333;
    }
    .ct-input {
      width: calc(100% - 24px);
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .ct-button {
      background: #007bff;
      color: #fff;
      border: none;
      padding: 12px 20px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      transition: all .3s;
    }
    .ct-button:hover {
      background: #0056b3;
    }
    .ct-button.searching {
      background: #dc3545;
    }
    .ct-result {
      margin-top: 15px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
      min-height: 60px;
      font-size: 14px;
      color: #333;
      font-weight: bold;
      max-height: 400px;
      overflow-y: auto;
    }
    .ct-copy-button {
      background: #28a745;
      color: #fff;
      border: none;
      padding: 12px 20px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      transition: background .3s;
      margin-top: 10px;
      display: none;
    }
    .ct-copy-button.active {
      display: block;
    }
    .ct-copy-button:hover {
      background: #218838;
    }
    .copy-feedback {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(40,167,69,0.9);
      color: #fff;
      padding: 10px 20px;
      border-radius: 4px;
      display: none;
      z-index: 9999999;
    }
    .loading { color: #ff9800; }
    .success { color: #2c8f2c; }
    .error { color: #d9534f; }
    .transaction-item {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .transaction-item:last-child {
      border-bottom: none;
    }
    .transaction-header {
      font-size: 16px;
      margin-bottom: 8px;
      color: #333;
    }
    .transaction-number {
      text-decoration: underline;
      cursor: pointer;
      color: #0066cc;
      font-weight: bold;
    }
    .transaction-number:hover {
      color: #004080;
      text-decoration: underline;
    }
    .transaction-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .transaction-detail {
      display: flex;
      justify-content: space-between;
    }
    .detail-label {
      font-weight: normal;
      color: #666;
    }
    .detail-value {
      font-weight: bold;
      color: #333;
    }
    .ct-progress-container {
      position: relative;
      width: 100%;
      height: 20px;
      background: #eee;
      border-radius: 5px;
      margin-top: 10px;
      display: none;
      overflow: hidden;
    }
    .ct-progress-bar {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      width: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }
    .ct-progress-text {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      text-align: center;
      color: #fff;
      font-size: 12px;
      line-height: 1.666;
    }
    /* إضافة تحريك للساعة الرملية - دوران كامل */
    @keyframes hourglassAnimation {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animated-hourglass {
      display: inline-block;
      animation: hourglassAnimation 2s infinite linear;
    }
  `);
}

// تصدير الدالة للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addGlobalStyles };
}
