# AI 多人聊天室

一个基于 React 的多人 AI 聊天应用，支持多个 AI 角色同时参与对话，提供类似群聊的交互体验。

## 功能特点

- 🤖 支持多个 AI 角色同时对话
- 💬 实时流式响应
- 🎭 可自定义 AI 角色和个性
- 👥 群组管理功能
- 🔇 AI 角色禁言功能
- 📝 支持 Markdown 格式
- ➗ 支持数学公式显示（KaTeX）
- 🎨 美观的 UI 界面
- 📱 响应式设计，支持移动端




## 一键部署到cloudflare

1. Fork 本项目到你的 GitHub 账号

2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入  Workers & Pages 页面
   - 点击 "Create a application > Pages" 按钮
   - 选择 "Connect to Git"

3. 配置部署选项
   - 选择你 fork 的仓库
   - 设置以下构建配置：
     - Framework preset: React
     - Build command: `npm run build`
     - Build output directory: `dist`
     - 环境变量（必须）：
       ```
        DASHSCOPE_API_KEY=xxx //千问模型KEY
        HUNYUAN_API_KEY=xxx //混元模型KEY
        ARK_API_KEY=xxx //豆包模型KEY
       ```

4. 点击 "Save and Deploy"
   - Cloudflare Pages 会自动构建和部署你的应用
   - 完成后可通过分配的域名访问应用

注意：首次部署后，后续的代码更新会自动触发重新部署。


## 自定义（可选）

1. 配置 AI 角色
   - 在 `config/aiCharacters.ts` 中配置 AI 角色信息
        ```typescript
        id: string;        // 角色唯一标识
        name: string;      // 角色显示名称
        personality: string; // 角色性格描述
        model: string;     // 使用的模型，可选值: qwen/hunyuan/ark
        avatar?: string;   // 可选的头像 URL
        custom_prompt?: string;  // 可选的自定义提示词
        ```
   
   示例配置：
   ```typescript
   {
     id: "assistant1",
     name: "小助手",
     personality: "友善、乐于助人的AI助手",
     model: "qwen",//注意豆包的配置需要填写火山引擎的接入点
     avatar: "/avatars/assistant.png",
     custom_prompt: "你是一个热心的助手，擅长解答各类问题。"
   }
   ```
2. 配置群组
   - 在 `config/groups.ts` 中配置群组信息
        ```typescript
        id: string;        // 群组唯一标识
        name: string;      // 群组名称
        description: string; // 群组描述
        members: string[]; // 群组成员ID数组
        ```
   
   示例配置：
   ```typescript
   {
     id: "group1",
     name: "AI交流群",
     description: "AI角色们的日常交流群",
     members: ["ai1", "ai2", "ai3"] // 成员ID需要与 aiCharacters.ts 中的id对应
   }
   ```

   注意事项：
   - members 数组中的成员 ID 必须在 `aiCharacters.ts` 中已定义
   - 每个群组必须至少包含两个成员
   - 群组 ID 在系统中必须唯一



## 贡献指南

欢迎提交 Pull Request 或提出 Issue。

## 许可证

[MIT License](LICENSE)
