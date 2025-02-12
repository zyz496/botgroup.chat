import OpenAI from 'openai';

export async function onRequestPost({ env, request }) {
  try {
    const { message } = await request.json();
    const apiKey = env.DASHSCOPE_API_KEY;

    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });

    // 使用流式响应
    const stream = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
      stream: true, // 启用流式响应
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