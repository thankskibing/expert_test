/**
 * AI 퍼소나 전문가 평가 응답 저장용 Google Apps Script (v5: 8단계 프로세스 검증 구조)
 *
 * 붙여넣기 / 재배포 방법
 * 1) 응답 시트 → 확장 프로그램 → Apps Script → 기존 코드를 모두 지우고 이 코드를 붙여넣은 뒤 저장
 * 2) 배포 → 배포 관리 → (기존 웹 앱 배포) 연필 아이콘 → 버전: "새 버전" → 배포
 *    ※ "새 배포"를 만들면 주소가 바뀌어요. 같은 주소를 유지하려면 반드시 "배포 관리"에서 새 버전으로 올려 주세요.
 *
 * 만들어지는 시트. 열 이름은 내부 키가 아니라 실제 질문 문구예요.
 * - 0 기본 프로필
 * - 1 연구 개요 / 2 수집전처리 / 3 토픽집단구성 / 4 AI분석 / 5 발화분석 / 5 정성퍼소나 / 6 퍼소나비교 / 8 종합평가
 * - 7 최종 품질 평가: 문항 1개 = 1행(긴 형식)
 * - 7 최종 품질 평가(메모): 영역별 추가 질문 답변만
 * - 4-3 리뷰별 판정: 리뷰 1건 평가 = 1행
 * - 5-3 참여자별 판정: 참여자 1명 평가 = 1행
 * - 응답(전체): 제출 1건 = 1행짜리 백업용 전체 보기. 평소엔 안 보셔도 돼요.
 * - 오류 로그: 저장 중 오류가 나면 여기 남아요.
 */
var SHEET_ID = '1Tu4XR3M-3gqhq_NDRszfehYORpTeyzzVZY3TtTKSnqo';

// 열 이름(키) 접두어로 어느 탭에 넣을지 정해요. 위에서부터 먼저 맞는 규칙을 써요.
var SECTIONS = [
  { name: '0 기본 프로필', test: function (k) { return k.indexOf('profile.') === 0 } },
  { name: '1 연구 개요', test: function (k) { return k.indexOf('step1.') === 0 } },
  { name: '2 수집전처리', test: function (k) { return k.indexOf('step2.') === 0 } },
  { name: '3 토픽집단구성', test: function (k) { return k.indexOf('step3.') === 0 } },
  { name: '4 AI분석', test: function (k) { return k.indexOf('step4.') === 0 } },
  { name: '5 발화분석', test: function (k) { return k.indexOf('step5pattern.') === 0 } },
  { name: '5 정성퍼소나', test: function (k) { return k.indexOf('step5qual.') === 0 } },
  { name: '6 퍼소나비교', test: function (k) { return k.indexOf('step6.') === 0 } },
  { name: '7 최종 품질 평가(메모)', test: function (k) { return k.indexOf('note.') === 0 } },
  { name: '8 종합평가', test: function (k) { return k.indexOf('step8.') === 0 } },
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

    // 2) 7 최종 품질 평가: 문항 1개 = 1행(긴 형식), 이미 한글 열이에요.
    var longHeader = ['제출 시각', '평가자'].concat(data.ratingHeader || [])
    var long = sheet_(ss, '7 최종 품질 평가', longHeader)
    var rows = (data.ratingRows || []).map(function (r) { return [received, data.evaluator].concat(r) })
    if (rows.length) long.getRange(long.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows)

    // 2b) 4-3 리뷰별 판정: 리뷰 1건 평가 = 1행
    var reviewHeader = ['제출 시각', '평가자'].concat(data.reviewHeader || [])
    var reviewSh = sheet_(ss, '4-3 리뷰별 판정', reviewHeader)
    var reviewRows = (data.reviewRows || []).map(function (r) { return [received, data.evaluator].concat(r) })
    if (reviewRows.length) reviewSh.getRange(reviewSh.getLastRow() + 1, 1, reviewRows.length, reviewRows[0].length).setValues(reviewRows)

    // 2c) 5-3 참여자별 판정: 참여자 1명 평가 = 1행
    var interviewHeader = ['제출 시각', '평가자'].concat(data.interviewHeader || [])
    var interviewSh = sheet_(ss, '5-3 참여자별 판정', interviewHeader)
    var interviewRows = (data.interviewRows || []).map(function (r) { return [received, data.evaluator].concat(r) })
    if (interviewRows.length) interviewSh.getRange(interviewSh.getLastRow() + 1, 1, interviewRows.length, interviewRows[0].length).setValues(interviewRows)

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
