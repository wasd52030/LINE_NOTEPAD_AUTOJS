const autojsUtils = require('./lib/autojs-utils');

// autojsUtils.test();

launchApp('LINE');
sleep(1000);

// 點選聊天按鈕
id('bnb_chat').findOnce().find(id('bnb_button_clickable_area')).click();
sleep(1000);

// 尋找並進入目標群組
let group = textContains('groupname').filter(item => {
    let p = item.parent();
    return p && p.find(id('date')).nonEmpty();
})
autojsUtils.scrollSearch(group).parent().click();
sleep(1000);

// 進入群組詳細頁面(記事本在裡面)
id('right_header_button').findOnce().children().findOne(id('header_button_img')).parent().click();
sleep(1000);

// 進入記事本
id('text_with_icon_layout').findOnce().children().findOne(text('記事本')).parent().click();
sleep(1000);


let topic = 'notepad_topic';
let notepadSelector = textContains(topic)
// 在記事本裡面搜尋特定日期的內容(模擬滑動)
let targertNotepad = autojsUtils.scrollSearch(notepadSelector);
if (targertNotepad) {
    let b = targertNotepad.bounds();

    // 找到留言區並打開
    let groups = classNameMatches(/.*Group/).filter(item => {
        let it = item.bounds();
        // 條件：在基準底部之下，且在定義的 offset 範圍內
        // 且寬度要夠大（避免抓到小的圖示容器），高度也要合理
        return it.top >= b.bottom &&
            it.bottom <= b.bottom + 1080 &&
            it.width() > device.width * 0.5 &&
            it.height() > 50;
    }).findOne();
    groups.findOne(id('post_reaction_comment')).click();

    let w = className('android.view.ViewGroup').find();
    console.log(w.length);

    // 完全展開留言區
    autojsUtils.ensureFullyExpanded();

    // 回朔並記錄留言區
    let comments = autojsUtils.getAllComments();

    let result = comments.join('\n');

    let path = files.join(files.getSdcardPath(), "Download");
    let defaultFileName = `${topic}.txt`;

    let fullPath = files.join(path, defaultFileName);
    files.ensureDir(fullPath); // 確保資料夾存在

    // 寫入檔案
    files.write(fullPath, result);

    toastLog("存檔成功：" + fullPath);
}
