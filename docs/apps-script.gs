/**
 * AI 퍼소나 전문가 평가 응답 저장용 Google Apps Script (v6: 질문 ID 기준 매칭)
 *
 * ■ v5에서 질문과 답이 어긋났던 이유
 *  1) 열을 '질문 문구'로만 찾았어요. 문구가 같은 질문이 두 개 있으면(예: "그렇게 평가하신 이유나 근거를 적어 주세요.")
 *     뒤 답이 앞 답을 덮어써서 한 칸이 비고 다른 칸에 엉뚱한 답이 들어갔어요.
 *  2) 머리글 행에 빈 칸이 있으면 그 칸을 건너뛰고 열 번호를 세서, 그 뒤 답이 한 칸씩 밀려 들어갔어요.
 *  3) 질문 문구를 고치면 새 열이 생기고 예전 열은 그대로 남아, 같은 질문의 답이 두 열로 나뉘었어요.
 *
 * ■ v6에서 바뀐 점
 *  - 각 열 머리글 칸에 '질문 ID'를 메모(셀 메모)로 붙이고, 열은 이 ID로 찾아요. 문구가 같아도, 문구를 고쳐도 같은 열에 들어가요.
 *    (머리글 칸에 마우스를 올리면 ID가 보여요. 메모를 지우지 마세요.)
 *  - 문구를 고친 질문은 머리글 문구만 최신 문구로 바꾸고, 답은 같은 열에 계속 쌓여요.
 *  - 빈 머리글 칸이 있어도 실제 열 위치 그대로 써서 밀리지 않아요.
 *  - 한 행을 통째로 만든 뒤 한 번에 써요(appendRow 대신 setValues).
 *  - 탭 이름을 사이트 단계 번호(0~7단계)와 맞췄어요. 예전 탭은 그대로 두고 새 탭에 쌓여요.
 *
 * ■ 붙여넣기 / 재배포 방법
 *  1) 응답 시트 → 확장 프로그램 → Apps Script → 기존 코드를 모두 지우고 이 코드를 붙여넣은 뒤 저장
 *  2) 배포 → 배포 관리 → (기존 웹 앱 배포) 연필 아이콘 → 버전: "새 버전" → 배포
 *     ※ "새 배포"를 만들면 주소가 바뀌어요. 같은 주소를 유지하려면 반드시 "배포 관리"에서 새 버전으로 올려 주세요.
 *  3) 실제 평가 전에 예전 탭(테스트 응답)은 이름을 바꾸거나 지워 두면 헷갈리지 않아요.
 *
 * ■ 만들어지는 탭
 *  - 0 사전 질문 / 1 연구 개요 / 2 수집전처리 / 3 토픽모델링 / 4 리뷰 기반 분석 / 5 인터뷰 기반 분석 / 7 종합평가
 *  - 6 최종 품질 평가: 문항 1개 = 1행(긴 형식)
 *  - 6 최종 품질 평가(의견): 퍼소나별 서술형 답변과 제시 순서
 *  - 4-3 리뷰별 판정 / 5-3 참여자별 판정: 1건 = 1행
 *  - 응답(전체): 제출 1건 = 1행짜리 백업용 전체 보기
 *  - 오류 로그: 저장 중 오류가 나면 여기 남아요.
 */
var SHEET_ID = '1Tu4XR3M-3gqhq_NDRszfehYORpTeyzzVZY3TtTKSnqo';

// 질문 ID(키) 접두어로 어느 탭에 넣을지 정해요. 위에서부터 먼저 맞는 규칙을 써요.
var SECTIONS = [
  { name: '0 사전 질문', test: function (k) { return k.indexOf('profile.') === 0 } },
  { name: '1 연구 개요', test: function (k) { return k.indexOf('step1.') === 0 } },
  { name: '2 수집전처리', test: function (k) { return k.indexOf('step2.') === 0 } },
  { name: '3 토픽모델링', test: function (k) { return k.indexOf('step3.') === 0 } },
  { name: '4 리뷰 기반 분석', test: function (k) { return k.indexOf('step4.') === 0 } },
  { name: '5 인터뷰 기반 분석', test: function (k) { return k.indexOf('step5pattern.') === 0 || k.indexOf('step5qual.') === 0 } },
  { name: '6 최종 품질 평가(의견)', test: function (k) { return k.indexOf('note.') === 0 || k.indexOf('step7.') === 0 } },
  { name: '7 종합평가', test: function (k) { return k.indexOf('step8.') === 0 } },
]

// 모든 탭 맨 앞에 오는 고정 열
var FIXED = [
  { key: '_received', label: '제출 시각' },
  { key: '_evaluator', label: '평가자' },
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
    var fixedValues = { _received: received, _evaluator: data.evaluator }

    // 1) 단계별 탭: 질문 ID로 열을 찾아 한 행씩 기록해요.
    SECTIONS.forEach(function (sec) {
      var secKeys = keys.filter(sec.test)
      if (!secKeys.length) return
      var cols = FIXED.map(function (f) { return { key: f.key, label: f.label, value: fixedValues[f.key] } })
        .concat(secKeys.map(function (k) { return { key: k, label: labelOf(k), value: data.answers[k] } }))
      writeRow_(ss, sec.name, cols)
    })

    // 2) 긴 형식 탭: 1건 = 1행. 열 이름 자체가 고정이라 이름으로 매칭해요.
    writeLong_(ss, '6 최종 품질 평가', data.ratingHeader, data.ratingRows, received, data.evaluator)
    writeLong_(ss, '4-3 리뷰별 판정', data.reviewHeader, data.reviewRows, received, data.evaluator)
    writeLong_(ss, '5-3 참여자별 판정', data.interviewHeader, data.interviewRows, received, data.evaluator)

    // 3) 응답(전체): 모든 질문을 한 행에 (백업용)
    var all = FIXED.map(function (f) { return { key: f.key, label: f.label, value: fixedValues[f.key] } })
      .concat(keys.map(function (k) { return { key: k, label: labelOf(k), value: data.answers[k] } }))
    writeRow_(ss, '응답(전체)', all)

    return json_({ ok: true })
  } catch (err) {
    try {
      var book = SpreadsheetApp.openById(SHEET_ID)
      var es = book.getSheetByName('오류 로그') || book.insertSheet('오류 로그')
      es.appendRow([new Date(), String(err && err.stack || err), e && e.postData && e.postData.contents])
    } catch (e2) { /* 로그 저장도 실패하면 조용히 넘어가요 */ }
    return json_({ ok: false, error: String(err) })
  } finally {
    lock.releaseLock()
  }
}

/**
 * cols: [{ key, label, value }]
 * 머리글 행(1행)의 각 칸 메모에 질문 ID를 적어 두고, 그 ID로 열 위치를 찾아요.
 * 없는 질문은 맨 오른쪽에 새 열로 추가하고, 문구가 바뀐 질문은 머리글 문구만 최신으로 고쳐요.
 */
function writeRow_(ss, name, cols) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name)
  var lastCol = sh.getLastColumn()
  var colByKey = {}
  if (lastCol > 0) {
    var head = sh.getRange(1, 1, 1, lastCol)
    var notes = head.getNotes()[0]
    var labels = head.getValues()[0]
    for (var i = 0; i < lastCol; i++) {
      // 메모(질문 ID)가 있으면 ID로, 없으면(고정 열 등) 머리글 문구로 찾아요.
      var id = notes[i] ? String(notes[i]).trim() : ''
      if (id) colByKey[id] = i + 1
      else if (labels[i] === '제출 시각') colByKey._received = i + 1
      else if (labels[i] === '평가자') colByKey._evaluator = i + 1
    }
  }

  var next = lastCol + 1
  cols.forEach(function (c) {
    var col = colByKey[c.key]
    if (!col) {
      col = next++
      if (col > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), col - sh.getMaxColumns())
      var cell = sh.getRange(1, col)
      cell.setValue(c.label)
      if (c.key.charAt(0) !== '_') cell.setNote(c.key)
      colByKey[c.key] = col
    } else if (c.key.charAt(0) !== '_') {
      var h = sh.getRange(1, col)
      if (h.getValue() !== c.label) h.setValue(c.label) // 문구가 바뀐 질문: 머리글만 최신 문구로
    }
  })
  if (sh.getFrozenRows() < 1) sh.setFrozenRows(1)

  var width = Math.max(sh.getLastColumn(), next - 1)
  var row = []
  for (var j = 0; j < width; j++) row.push('')
  cols.forEach(function (c) {
    var v = c.value
    row[colByKey[c.key] - 1] = v === undefined || v === null ? '' : v
  })
  sh.getRange(sh.getLastRow() + 1, 1, 1, width).setValues([row])
}

/** 긴 형식(1건 = 1행) 탭. 머리글 이름이 고정이라 이름으로 열을 맞춰요. */
function writeLong_(ss, name, header, rows, received, evaluator) {
  if (!header || !rows || !rows.length) return
  var full = ['제출 시각', '평가자'].concat(header)
  var sh = ss.getSheetByName(name)
  if (!sh) {
    sh = ss.insertSheet(name)
    sh.getRange(1, 1, 1, full.length).setValues([full])
    sh.setFrozenRows(1)
  }
  var lastCol = Math.max(sh.getLastColumn(), 1)
  var existing = sh.getRange(1, 1, 1, lastCol).getValues()[0]
  var pos = {}
  existing.forEach(function (h, i) { if (h !== '') pos[h] = i + 1 })
  var width = lastCol
  full.forEach(function (h) {
    if (!pos[h]) {
      width += 1
      if (width > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), width - sh.getMaxColumns())
      sh.getRange(1, width).setValue(h)
      pos[h] = width
    }
  })
  var out = rows.map(function (r) {
    var line = []
    for (var j = 0; j < width; j++) line.push('')
    var vals = [received, evaluator].concat(r)
    full.forEach(function (h, i) { line[pos[h] - 1] = vals[i] === undefined || vals[i] === null ? '' : vals[i] })
    return line
  })
  sh.getRange(sh.getLastRow() + 1, 1, out.length, width).setValues(out)
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)
}
