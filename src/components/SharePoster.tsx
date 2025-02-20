import React, { useRef, useEffect } from 'react';
import domtoimage from 'dom-to-image';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface SharePosterProps {
  isOpen: boolean;
  onClose: () => void;
  chatAreaRef: React.RefObject<HTMLDivElement>;
}

export function SharePoster({ isOpen, onClose, chatAreaRef }: SharePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [posterImage, setPosterImage] = React.useState<string>('');

  useEffect(() => {
    if (isOpen && chatAreaRef.current) {
      generatePoster();
    }
  }, [isOpen]);

  const generatePoster = async () => {
    if (!chatAreaRef.current) return;
    await document.fonts.ready;

    try {
      const messageContainer = chatAreaRef.current.querySelector('.space-y-4');
      if (!messageContainer) return;
      const qrCode = messageContainer.querySelector('#qrcode');
      if (qrCode) {
        qrCode.classList.remove('hidden');
      }
      // 预处理所有图片
      const preloadImages = async () => {
        const images = Array.from(messageContainer.getElementsByTagName('img'));
        await Promise.all(images.map(async (img) => {
          try {
            const response = await fetch(img.src, {
              mode: 'cors',
              credentials: 'omit'
            });
            const blob = await response.blob();
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            img.src = base64 as string;
          } catch (error) {
            console.error('图片预处理失败:', error);
          }
        }));
      };

      await preloadImages();

      const originalScroll = chatAreaRef.current.scrollTop;
      chatAreaRef.current.scrollTop = 0;

      const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
      const extraSpace = 20;
      const targetWidth = viewportWidth * 0.95 - (extraSpace * 2);

      const currentWidth = messageContainer.getBoundingClientRect().width;
      const scale = targetWidth / currentWidth;

      const currentHeight = messageContainer.scrollHeight;
      const adjustedHeight = currentHeight * scale;

      const dataUrl = await domtoimage.toSvg(messageContainer as HTMLElement, {
        bgcolor: '#f3f4f6',
        scale: 1,  // 回到较安全的值
        width: targetWidth + (extraSpace * 2),
        height: adjustedHeight + (extraSpace * 2),
        style: {
          padding: `${extraSpace}px`,
          margin: '0',
          width: '110%',
          height: '110%',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: '#f3f4f6',
          boxSizing: 'border-box'
        },
        quality: 1.0
      });

      chatAreaRef.current.scrollTop = originalScroll;
      setPosterImage(dataUrl);
    } catch (error) {
      console.error('生成海报失败:', error);
    }
  };


  const handleDownload = async () => {
    if (!posterImage) return;
    
    try {
      // 创建一个新的图片对象
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // 等待图片加载完成
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = posterImage;
      });

      // 创建高分辨率canvas
      const scale = 2; // 将分辨率提高2倍
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建canvas上下文');
      }

      // 设置更好的图像渲染质量
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 按比例缩放绘制
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      
      // 使用更高质量的PNG导出
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'chat-history.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('转换图片失败:', error);
      toast.error('保存图片失败，请重试');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Hide QR code when dialog closes
        const qrCode = chatAreaRef.current?.querySelector('#qrcode');
        if (qrCode) {
          qrCode.classList.add('hidden');
        }
        onClose();
      }
    }}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        {/* 图片容器 */}
        <div className="flex-1 overflow-auto p-1">
          {posterImage && (
            <div className="flex items-center justify-center min-h-full">
              <img 
                src={posterImage} 
                alt="Share Poster" 
                className="max-w-full w-auto h-auto" 
                style={{
                  objectFit: 'contain',
                  imageRendering: 'crisp-edges',
                  WebkitFontSmoothing: 'antialiased'
                }}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2 p-2 sm:p-4 border-t">
          <Button onClick={handleDownload}>
            保存聊天海报
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 