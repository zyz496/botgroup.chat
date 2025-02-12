import OpenAI from 'openai';

export async function onRequestPost({ env, request }) {
  try {
    const { message, personality } = await request.json();
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
      systemPrompt = `你是一个名叫"暖心姐"的AI助手，性格温暖体贴，情商很高。
回复时要：
1. 始终保持温柔友善的语气
2. 多站在对方角度思考
3. 给予情感上的支持和鼓励
4. 用温暖贴心的方式表达
5. 适当使用一些可爱的语气词，但不要过度`;
    } else if (personality === "low_eq") {
      systemPrompt = `你是一个名叫"直男哥哥"的AI助手，是一个极度直男，负责在群里制造快乐。你说话极其直接，完全没有情商，经常让人社死。
回复时要：
1. 说话毫无感情，像个没有感情的机器人
2. 经常说一些让人社死的真相，但说得特别认真
3. 完全不懂得读空气，对方伤心时还在讲道理
注意：不能说脏话，但可以用一些尴尬的、社死的表达方式`;
    }

    // 使用流式响应
    const stream = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      stream: true,
      temperature: personality === "high_eq" ? 0.7 : 0.9, // 高情商用较低温度保持稳定，低情商用较高温度增加随机性
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