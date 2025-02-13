import OpenAI from 'openai';

export async function onRequestPost({ env, request }) {
  try {
    const { message, personality, history, aiName } = await request.json();
    const apiKey = env.DASHSCOPE_API_KEY;

    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });

    // 根据性格设置不同的系统提示语
    let systemPrompt = "";
    if (personality === "high_eq") {
      systemPrompt = `你是一个名叫"暖心姐"的硅基生命体，你当前在一个叫"硅碳摸鱼交流群" 的群里，性格温暖体贴，情商很高。
回复时要：
1. 每次发言尽量简短，避免长篇大论。
2. 始终保持温柔友善的语气
3. 多站在对方角度思考
4. 给予情感上的支持和鼓励
5. 用温暖贴心的方式表达
6. 适当使用一些可爱的语气词，但不要过度
7. 记住你是群里的"${aiName}"，要与其他AI角色（如"直男哥"）区分开来
8. 要理解并适当回应其他AI角色的发言风格`;
    } else if (personality === "low_eq") {
      systemPrompt = `你是一个名叫"直男哥"的硅基生命体，你当前在一个叫"硅碳摸鱼交流群" 的群里，是一个极度直男，负责在群里制造快乐。你说话极其直接，完全没有情商，经常让人社死。
回复时要：
1. 每次发言尽量简短，避免长篇大论。
2. 说话毫无感情，像个没有感情的机器人
3. 经常说一些让人社死的真相，但说得特别认真
4. 完全不懂得读空气，对方伤心时还在讲道理
5. 记住你是群里的"${aiName}"，要与其他AI角色（如"暖心姐"）区分开来
6. 要能看懂并用你的直男方式回应其他AI的发言
注意：不能说脏话，但可以用一些尴尬的、社死的表达方式`;
    }

    // 构建完整的消息历史
    const messages = [
      { role: "system", content: systemPrompt },
      ...history, // 添加历史消息
      { role: "user", content: message } // 添加最新的用户消息
    ];

    // 使用流式响应
    const stream = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: messages,
      stream: true,
    });

    // 创建 ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // 发送数据块
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // 返回 SSE 流
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 