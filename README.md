# 小丑牌游戏 (xiaochoupai-game)

Balatro 风格的网页卡牌游戏，使用 Vue 3 + Vite 开发。支持 52 张标准牌、9 种手牌类型、6 种小丑牌、AI 出牌建议、商店系统和设置面板，深蓝水彩主题。

## 安装

```bash
# 需要 Node.js 18+
npm install
```

## 使用

```bash
# 本地开发（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器默认运行在 `http://localhost:5173`（端口被占用时自动递增）。

## 目录结构

```
src/
  App.vue           # 根组件，游戏状态机
  gameLogic.js      # 纯函数：洗牌、手牌识别、得分计算、AI
  main.js           # 入口
  assets/
    main.css        # 全局样式与 CSS 变量
  components/
    SideBar.vue     # 左侧信息栏
    PlayArea.vue    # 中央出牌区
    HandArea.vue    # 手牌区与操作按钮
    JokerArea.vue   # 小丑牌槽位
    PlayingCard.vue # 单张扑克牌
    JokerCard.vue   # 单张小丑牌
    ShopScreen.vue  # 商店界面
    EndScreen.vue   # 胜利/失败界面
    SettingsModal.vue # 设置弹窗
```
