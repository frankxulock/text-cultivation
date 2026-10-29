# 上架 Telegram Mini App + AdsGram 广告

参考德州客户端的 `Telegram.WebApp` 初始化，以及 TG 小游戏常用的 [AdsGram](https://docs.adsgram.ai/publisher/) 激励/插屏广告。

## 1. 构建静态包

```bash
cp .env.example .env
# 编辑 .env，填入 BlockId 与机器人用户名

npm install
npm run build
```

产物在 `dist/`，可部署到任意 HTTPS 静态托管（Cloudflare Pages / Vercel / OSS / Nginx）。

**要求：必须 HTTPS**，否则 Telegram 无法打开 Mini App。

## 2. 创建 Bot 并挂 Mini App

1. 打开 [@BotFather](https://t.me/BotFather) → `/newbot` 创建机器人  
2. `/newapp` → 选择该 bot → 填写名称、描述  
3. 上传宣传图：`public/promo-640x360.jpg`（640×360）  
4. Web App URL 填你的 `https://你的域名/`（指向 `dist`）  
5. 记录 bot 用户名，写入 `.env` 的 `VITE_BOT_USERNAME` 后重新 build

可选：`/setmenubutton` 将菜单按钮指到 Mini App，方便用户一键进入。

## 3. 接入 AdsGram（与 Bcoin2048 等同类玩法）

1. 注册 [partner.adsgram.ai](https://partner.adsgram.ai)  
2. 创建 **Platform**（类型选 Telegram Mini App，填入 Mini App 链接）  
3. 创建两个 **Ad unit**：  
   - Reward（激励）→ `VITE_ADSGRAM_REWARD_BLOCK_ID`  
   - Interstitial（插屏）→ `VITE_ADSGRAM_INTERSTITIAL_BLOCK_ID`  
4. 提交审核（Start）通过后，正式环境将 `VITE_ADS_DEBUG=false` 再 build  

### 游戏内触发点（已接好）

| 类型 | 触发 | 奖励 |
|------|------|------|
| Reward | 主界面「看广告」→「看广告领补给」 | 灵石/灵气/声望 + 2 日凝神（每日上限 8 次） |
| Interstitial | 每外出 3 次后的自然停顿 | 无奖励，仅变现 |
| 邀请 | 「邀请好友」分享 `?startapp=inv_{tgId}` | 被邀请者首次进入领开局补给 |

本地未配置 BlockId 时，激励广告会弹出确认框模拟，便于调试奖励链路。

## 4. 自测清单

- [ ] 手机 Telegram 内打开 bot → Mini App 全屏、返回键可关闭  
- [ ] 看广告能发奖，达每日上限后拦截  
- [ ] 外出多次后插屏可弹出（审核通过后）  
- [ ] 邀请链接 `startapp` 能领一次补给  
- [ ] 刷新后存档仍在  

## 5. 合规注意

- 激励广告必须由玩家主动点击触发（已实现）  
- 插屏放在外出后的停顿，避免连点刷屏  
- AdsGram 结算为 USD₮，详见其出版社文档  
