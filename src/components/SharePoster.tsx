import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download } from 'lucide-react';

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
    
    try {
      // 克隆原始聊天区域以保持样式
      const clonedChat = chatAreaRef.current.cloneNode(true) as HTMLElement;
      
      // 创建临时容器并设置与原始容器相同的样式
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = chatAreaRef.current.offsetWidth + 'px';
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(clonedChat);

      // 确保所有图片都已加载
      const images = Array.from(clonedChat.getElementsByTagName('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const canvas = await html2canvas(clonedChat, {
        backgroundColor: '#f3f4f6',
        scale: 2,
        useCORS: true, // 允许跨域图片
        logging: false,
        onclone: (document) => {
          // 确保所有样式都被正确应用
          const styles = Array.from(document.styleSheets);
          styles.forEach(styleSheet => {
            try {
              if (styleSheet.cssRules) {
                Array.from(styleSheet.cssRules).forEach(rule => {
                  clonedChat.style.cssText += rule.cssText;
                });
              }
            } catch (e) {
              console.warn('无法访问样式表:', e);
            }
          });
        }
      });
      
      // 清理临时元素
      document.body.removeChild(tempContainer);
      
      setPosterImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('生成海报失败:', error);
    }
  };

  const handleShare = async () => {
    if (!posterImage) return;

    try {
      const blob = await fetch(posterImage).then(r => r.blob());
      const filesArray = [
        new File([blob], 'chat-history.png', { type: 'image/png' })
      ];

      if (navigator.share && navigator.canShare({ files: filesArray })) {
        await navigator.share({
          files: filesArray,
          title: '聊天记录',
        });
      } else {
        throw new Error('不支持系统分享');
      }
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请尝试保存图片');
    }
  };

  const handleDownload = () => {
    if (!posterImage) return;
    
    const a = document.createElement('a');
    a.href = posterImage;
    a.download = 'chat-history.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
        <div className="space-y-4">
          <div 
            ref={posterRef}
            className="bg-white rounded-lg p-4 max-w-full"
          >
            {posterImage && (
              <img 
                src={posterImage} 
                alt="聊天记录" 
                className="w-full h-auto rounded-lg"
                style={{
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              保存图片
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 