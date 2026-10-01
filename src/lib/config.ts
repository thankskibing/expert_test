// 평가 응답을 저장할 Google Apps Script 웹앱 주소.
// 배포 후 받은 주소(https://script.google.com/macros/s/.../exec)를 여기에 넣거나,
// Vercel 환경변수 VITE_EVAL_ENDPOINT 로 설정하세요.
export const EVAL_ENDPOINT: string = import.meta.env.VITE_EVAL_ENDPOINT || 'https://script.google.com/macros/s/AKfycbzSje-MxC-MG7CnYvvBk_6yYRhif7qNW7tgGGATovu4sfblIMr6b3gnmc4wxuLbI_OfLQ/exec'
