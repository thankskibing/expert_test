/**
 * AI 퍼소나 전문가 평가 응답 저장용 Google Apps Script (v2: 인터뷰 흐름)
 *
 * 붙여넣기 / 재배포 방법
 * 1) 응답 시트 → 확장 프로그램 → Apps Script → 기존 코드를 모두 지우고 이 코드를 붙여넣은 뒤 저장
 * 2) 배포 → 배포 관리 → (기존 웹 앱 배포) 연필 아이콘 → 버전: "새 버전" → 배포
 *    ※ "새 배포"를 만들면 주소가 바뀌어요. 같은 주소를 유지하려면 반드시 "배포 관리"에서 새 버전으로 올려 주세요.
 *
 * 만들어지는 시트
 * - 응답(전체): 제출 1건 = 1행. 새 문항이 생기면 열이 자동으로 추가돼요.
 * - 척도 점수: 문항 1개 = 1행(긴 형식). 피벗 테이블·평균 계산용.
 * - 문항 설명: 응답(전체) 열 이름과 실제 질문 문구의 대응표.
 */
// 응답을 저장할 시트의 ID. 스크립트가 시트에 바인딩되어 있지 않아도 항상 이 시트를 열도록 고정해요.
var SHEET_ID = '1Tu4XR3M-3gqhq_NDRszfehYORpTeyzzVZY3TtTKSnqo';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var received = new Date();

    // 1) 응답(전체): 동적 헤더
    var wide = sheet_(ss, '응답(전체)', ['receivedAt']);
    var keys = ['receivedAt'].concat(data.keys || Object.keys(data.answers));
    var header = ensureHeader_(wide, keys);
    var row = header.map(function (h) {
      if (h === 'receivedAt') return received;
      var v = data.answers[h];
      return v === undefined || v === null ? '' : v;
    });
    wide.appendRow(row);

    // 2) 척도 점수: 긴 형식
    var longHeader = ['receivedAt', '평가자'].concat(data.ratingHeader || []);
    var long = sheet_(ss, '척도 점수', longHeader);
    var rows = (data.ratingRows || []).map(function (r) { return [received, data.evaluator].concat(r); });
    if (rows.length) long.getRange(long.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

    // 3) 문항 설명
    var lab = sheet_(ss, '문항 설명', ['열 이름', '질문']);
    var known = {};
    if (lab.getLastRow() > 1) lab.getRange(2, 1, lab.getLastRow() - 1, 1).getValues().forEach(function (r) { known[r[0]] = true; });
    var add = [];
    keys.forEach(function (k) { if (!known[k] && data.labels && data.labels[k]) add.push([k, data.labels[k]]); });
    if (add.length) lab.getRange(lab.getLastRow() + 1, 1, add.length, 2).setValues(add);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    try {
      var es = SpreadsheetApp.openById(SHEET_ID).getSheetByName('오류 로그') || SpreadsheetApp.openById(SHEET_ID).insertSheet('오류 로그');
      es.appendRow([new Date(), String(err), e && e.postData && e.postData.contents]);
    } catch (e2) { /* 로그 저장도 실패하면 조용히 넘어가요 */ }
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function sheet_(ss, name, header) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Adds any missing keys as new columns at the end and returns the full header. */
function ensureHeader_(sh, keys) {
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var header = sh.getRange(1, 1, 1, lastCol).getValues()[0].filter(function (h) { return h !== ''; });
  var changed = false;
  keys.forEach(function (k) { if (header.indexOf(k) < 0) { header.push(k); changed = true; } });
  if (changed) {
    var max = sh.getMaxColumns();
    if (header.length > max) sh.insertColumnsAfter(max, header.length - max);
    sh.getRange(1, 1, 1, header.length).setValues([header]);
  }
  return header;
}
