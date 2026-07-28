# GluMemo · 혈당·식사 일기

혼자 쓰는 모바일 친화 혈당/식사 기록 앱입니다.  
데이터는 서버 DB 없이 **기기 브라우저(localStorage)** 에 저장됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포 (GitHub + Vercel)

1. 이 저장소를 GitHub에 push
2. [Vercel](https://vercel.com/new)에서 해당 저장소를 Import
3. Framework Preset: **Vite** (자동 감지), Build `npm run build`, Output `dist`
4. Deploy 후 나온 URL을 휴대폰 브라우저에서 열고, 홈 화면에 추가

PC를 켜둘 필요 없이, 배포된 URL로 언제든 사용할 수 있습니다.

## 데이터 / DB

- **DB 불필요**: 개인 1인·1기기(주로 휴대폰) 사용이면 localStorage로 충분합니다.
- 기기 변경·데이터 삭제에 대비해 앱의 **통계 → JSON 내보내기/가져오기**로 백업하세요.
- PC와 휴대폰을 자동으로 동기화하려면 그때 DB(또는 클라우드 저장소)가 필요합니다.
