/**
 * AI 퍼소나 전문가 평가 응답 저장용 Google Apps Script (v4: 한글 질문을 열 이름으로 사용)
 *
 * 붙여넣기 / 재배포 방법
 * 1) 응답 시트 → 확장 프로그램 → Apps Script → 기존 코드를 모두 지우고 이 코드를 붙여넣은 뒤 저장
 * 2) 배포 → 배포 관리 → (기존 웹 앱 배포) 연필 아이콘 → 버전: "새 버전" → 배포
 *    ※ "새 배포"를 만들면 주소가 바뀌어요. 같은 주소를 유지하려면 반드시 "배포 관리"에서 새 버전으로 올려 주세요.
 *
 * 만들어지는 시트 (사이트 메뉴 순서와 맞춰놨어요). 열 이름은 내부 키가 아니라 실제 질문 문구예요.
 * - 1 기본 프로필: 그 단계 질문 응답만
 * - 2 퍼소나 비교: 그 단계 질문 응답만 (X/Y 배정 포함)
 * - 3 제작 데이터 확인: 그 단계 질문 응답만
 * - 4 전문가 평가: 문항 1개 = 1행(긴 형식). 라운드·출처·퍼소나·영역·문항별로 필터·피벗하기 좋아요.
 * - 4 전문가 평가(메모): 영역별 추가 질문 답변만
 * - 5 비교 평가: 마지막 단계 질문 응답만
 * - 응답(전체): 제출 1건 = 1행짜리 백업용 전체 보기. 평소엔 안 보셔도 돼요.
 * - 오류 로그: 저장 중 오류가 나면 여기 남아요.
 */
var SHEET_ID = '1Tu4XR3M-3gqhq_NDRszfehYORpTeyzzVZY3TtTKSnqo';

// 열 이름(키) 접두어로 어느 탭에 넣을지 정해요. 위에서부터 먼저 맞는 규칙을 써요.
var SECTIONS = [
  { name: '1 기본 프로필', test: function (k) { return k.indexOf('profile.') === 0 } },
  { name: '2 퍼소나 비교', test: function (k) { return k.indexOf('assign.') === 0 || k.indexOf('compare.') === 0 } },
  { name: '3 제작 데이터 확인', test: function (k) { return k.indexOf('evidence.') === 0 } },
  { name: '4 전문가 평가(메모)', test: function (k) { return k.indexOf('note.') === 0 } },
  { name: '5 비교 평가', test: function (k) { return k.indexOf('final.') === 0 } },
]

function doPost(e) {
  var lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    var data = JSON.parse(e.postData.contents)
    var ss = SpreadsheetApp.openById(SHEET_ID)
    var received = new Date()
    var keys = data.keys || Object.keys(data.answers)
    var labelOf = function (k) { return (data.labels && data.labels[k]) || k }

    // 1) 단계별 탭: 각 탭에 해당 접두어의 키만, 열 이름은 실제 질문 문구로 들어가요.
    SECTIONS.forEach(function (sec) {
      var secKeys = keys.filter(sec.test)
      if (!secKeys.length) return
      var sh = sheet_(ss, sec.name, ['제출 시각', '평가자'])
      var valueByLabel = {}
      secKeys.forEach(function (k) { valueByLabel[labelOf(k)] = data.answers[k] })
      var header = ensureHeader_(sh, ['제출 시각', '평가자'].concat(secKeys.map(labelOf)))
      var row = header.map(function (h) {
        if (h === '제출 시각') return received
        if (h === '평가자') return data.evaluator
        var v = valueByLabel[h]
        return v === undefined || v === null ? '' : v
      })
      sh.appendRow(row)
    })

    // 2) 4 전문가 평가: 문항 1개 = 1행(긴 형식), 이미 한글 열이에요.
    var longHeader = ['제출 시각', '평가자'].concat(data.ratingHeader || [])
    var long = sheet_(ss, '4 전문가 평가', longHeader)
    var rows = (data.ratingRows || []).map(function (r) { return [received, data.evaluator].concat(r) })
    if (rows.length) long.getRange(long.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows)

    // 3) 응답(전체): 백업용 전체 보기 (열 이름도 질문 문구)
    var wide = sheet_(ss, '응답(전체)', ['제출 시각'])
    var valueByLabelAll = {}
    keys.forEach(function (k) { valueByLabelAll[labelOf(k)] = data.answers[k] })
    var allHeader = ensureHeader_(wide, ['제출 시각'].concat(keys.map(labelOf)))
    var allRow = allHeader.map(function (h) {
      if (h === '제출 시각') return received
      var v = valueByLabelAll[h]
      return v === undefined || v === null ? '' : v
    })
    wide.appendRow(allRow)

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    try {
      var es = SpreadsheetApp.openById(SHEET_ID).getSheetByName('오류 로그') || SpreadsheetApp.openById(SHEET_ID).insertSheet('오류 로그')
      es.appendRow([new Date(), String(err), e && e.postData && e.postData.contents])
    } catch (e2) { /* 로그 저장도 실패하면 조용히 넘어가요 */ }
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON)
  } finally {
    lock.releaseLock()
  }
}

function sheet_(ss, name, header) {
  var sh = ss.getSheetByName(name)
  if (!sh) {
    sh = ss.insertSheet(name)
    sh.appendRow(header)
    sh.setFrozenRows(1)
  }
  return sh
}

/** Adds any missing column names at the end and returns the full header. */
function ensureHeader_(sh, names) {
  var lastCol = Math.max(sh.getLastColumn(), 1)
  var header = sh.getRange(1, 1, 1, lastCol).getValues()[0].filter(function (h) { return h !== '' })
  var changed = false
  names.forEach(function (n) { if (header.indexOf(n) < 0) { header.push(n); changed = true } })
  if (changed) {
    var max = sh.getMaxColumns()
    if (header.length > max) sh.insertColumnsAfter(max, header.length - max)
    sh.getRange(1, 1, 1, header.length).setValues([header])
  }
  return header
}
