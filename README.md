# 文字修仙经营

纯文字修仙 + 宗门经营。支持浏览器试玩与 **Telegram Mini App** 上架，广告走 **AdsGram**（激励 + 插屏）。

## 本地运行

```bash
npm install
cp .env.example .env   # 可选：填 AdsGram BlockId
npm run dev
```

## 上架 TG + 广告

详见 [PUBLISH.md](./PUBLISH.md)。

简述：

1. `npm run build` → 部署 `dist/` 到 HTTPS  
2. BotFather `/newapp` 挂上 Mini App URL，宣传图用 `public/promo-640x360.jpg`  
3. [AdsGram](https://partner.adsgram.ai) 创建 Reward / Interstitial，BlockId 写入 `.env` 后重新构建  

## 玩法摘要

闭关（含风险突破）· 经营（药园/炼器坊/灵脉/藏经阁）· 外出选址 · 炼丹 · 功法 · 法宝 · 任务 · **看广告领补给** · 邀请好友
