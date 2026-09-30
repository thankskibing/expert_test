/**
 * 퍼소나 전문가 평가 응답 저장용 Google Apps Script
 * 1) 응답을 받을 구글 시트 → 확장 프로그램 → Apps Script 에 이 코드를 붙여넣고 저장
 * 2) 배포 → 새 배포 → 유형: 웹 앱 / 실행 사용자: 나 / 액세스 권한: 모든 사용자 → 배포
 * 3) 나온 웹 앱 URL(https://script.google.com/macros/s/.../exec)을 사이트 설정에 넣습니다.
 */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var t = new Date();

  var ps = sheet_(ss, '퍼소나 평가', ['제출 시각', '평가자', '퍼소나', '퍼소나 이름', '근거 충분성', '변수 타당성', '서술 일치도', '구분 명확성', '의견']);
  data.personas.forEach(function (p) {
    ps.appendRow([t, data.evaluator, p.id, p.name, p.evidence, p.variables, p.consistency, p.distinct, p.comment]);
  });

  var rs = sheet_(ss, '핵심 리뷰 판정', ['제출 시각', '평가자', '퍼소나', '리뷰 번호', '판정', '의견']);
  data.reviews.forEach(function (r) {
    rs.appendRow([t, data.evaluator, r.persona, r.idx, r.verdict, r.note]);
  });

  var os = sheet_(ss, '종합 의견', ['제출 시각', '평가자', '종합 의견']);
  os.appendRow([t, data.evaluator, data.overall]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
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
