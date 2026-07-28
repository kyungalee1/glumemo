# GluMemo · 혈당·식사 일기

혼자 쓰는 모바일 친화 혈당/식사 기록 앱입니다.  
데이터는 서버 DB 없이 **기기 브라우저(localStorage)** 에 저장됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포 (GitHub + Vercel)

### GitHub (코드 + Pages)

- 저장소: https://github.com/kyungalee1/glumemo
- Pages URL: https://kyungalee1.github.io/glumemo/ (`main` push 시 Actions로 자동 배포)

### Vercel (권장 · 짧은 URL)

이 PC 환경에서는 CLI SSL 이슈로 자동 배포가 막힐 수 있습니다. 브라우저에서 한 번만 연결하면 됩니다.

1. [Vercel에서 이 저장소 Import](https://vercel.com/new/import?s=https://github.com/kyungalee1/glumemo)
2. Framework: **Vite** (자동), Build `npm run build`, Output `dist`
3. Deploy 후 나온 `*.vercel.app` URL을 휴대폰에서 사용
4. 이후 `main`에 push하면 Vercel이 자동 재배포합니다

PC를 켜둘 필요 없이, 배포된 URL로 언제든 사용할 수 있습니다.

## 데이터 / DB

- **DB 불필요**: 개인 1인·1기기(주로 휴대폰) 사용이면 localStorage로 충분합니다.
- 기기 변경·데이터 삭제에 대비해 앱의 **통계 → JSON 내보내기/가져오기**로 백업하세요.
- PC와 휴대폰을 자동으로 동기화하려면 그때 DB(또는 클라우드 저장소)가 필요합니다.
