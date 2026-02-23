module.exports = {
    greetingPrefix: 'Hello',
    test() {
        /* e.g. "Hello, AutoJs6 6.4.1" */
        toastLog(`${this.greetingPrefix}, ${context.getString(R.strings.app_name)} ${app.autojs.versionName}`);
    },
    scrollSearch(selector, maxRetries = 20) {
        for (let i = 0; i < maxRetries; i++) {
            let target = selector.findOnce();

            // 如果找到了，且元件在螢幕可見範圍內（避免找到被遮擋的頂部元件）
            if (target && target.bounds().bottom > 0 && target.bounds().top < device.height) {
                log("找到目標元件！");
                return target;
            }

            swipe(device.width / 2, device.height * 0.7,
                device.width / 2, device.height * 0.2, 800);

            sleep(1000); // 確保 LINE 列表加載完成
        }
        log("超過最大嘗試次數，未找到目標");
        return null;
    },
    ensureFullyExpanded() {
        // 尋找 LINE 留言區頂部的「橫條拖動把手」或標題列容器
        let handle = className("LinearLayout").find().findOne(textContains('留言'))
        console.log(handle.text());
        if (handle) {
            log("偵測到滑動把手，嘗試全展開");
            // 從把手位置往螢幕最頂端拉
            swipe(handle.bounds().centerX(), handle.bounds().centerY(),
                handle.bounds().centerX(), 100, 800);
            sleep(500);
        }
    },
    getAllComments() {
        let allComments = new Set(); // 用來存儲所有不重複的留言
        let lastTopText = "";        // 用來判定是否已經滑到頂部
        let sameContentCount = 0;    // 保險機制：內容重複次數

        log("開始由下往上擷取所有留言...");

        while (true) {
            // 1. 抓取當前畫面上所有的留言節點
            let nodes = id("comment_text").find();

            if (nodes.empty()) {
                log("當前畫面找不到留言節點");
            } else {
                // 2. 將當前畫面的文字加入 Set
                nodes.forEach(node => {
                    let txt = node.text();
                    if (txt) {
                        allComments.add(txt);
                    }
                });

                // 3. 檢查最頂端的文字，判斷是否已經到頂
                let currentTopText = nodes[0].text();
                log("當前最上方留言: " + currentTopText);

                if (currentTopText === lastTopText) {
                    sameContentCount++;
                } else {
                    sameContentCount = 0;
                }

                // 如果連續兩次最頂端文字一樣，代表滑不動了（到頂了）
                if (sameContentCount >= 2) {
                    log("已確認到達頂部，停止抓取");
                    break;
                }
                lastTopText = currentTopText;
            }

            // 4. 執行往上滑動 (手指從上往下撥，讓內容往回滾)
            // 座標建議：從螢幕上方 30% 滑到 80%
            swipe(device.width / 2, device.height * 0.3,
                device.width / 2, device.height * 0.8, 800);

            sleep(1200); // 等待 LINE 加載舊訊息與動畫停止
        }

        // 將 Set 轉回陣列並輸出
        let resultArray = Array.from(allComments);
        log("擷取完成！總計數量: " + resultArray.length);

        // // 輸出結果 (可選)
        // resultArray.forEach((msg, index) => {
        //     console.log((index + 1) + ". " + msg);
        // });

        return resultArray;
    }
};