我想构建这样一个应用（Love Physics）
用户输入一个对自然界或者生活中的一个现象，LLM基于这个现象生成一个帮助解释这个现象的内容
内容包括

- svg的代码，用于演示相关的物理概念帮助用户理解
- 相应的说明文本
- 类似的其他现象可以用同样的原理来解释
- 用户可能进一步探索的其他问题

技术框架

- nextjs 做前端
- convex 后端， 前端订阅来保证状态变更下的渲染
- langchain + zod 做LLM的交互，通过convex action
- llm 用open route的openai compatible的api可以直接用langchain的ChatOpenAI

可能的交互
用户问题 → 构建上下文 → LangChain+OpenRouter → 生成回答 → 显示卡片 → 点击AI提供的其他问题 -> 继续循环
一个session里上下文就用用户的输入 + AI 的说明文本来构建对话历史，
sidebar用来管理session，主窗口显示session中的所有生成历史，按时间顺序显示。自动滚动到最新的页卡

你先帮我用ascii art来设计这些页面，然后我们讨论核心数据模型。以及和LLM交互的prompt，秉持极简主义原则
