/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import { 
  Download, 
  Image as ImageIcon, 
  Type, 
  Layout as LayoutIcon, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  RefreshCw, 
  Layers, 
  Upload, 
  Info, 
  Share2, 
  Twitter, 
  Facebook, 
  Link as LinkIcon, 
  Check, 
  Pipette, 
  Palette 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type LayoutType = 'left' | 'center' | 'right';

export default function App() {
  const [mainCopy, setMainCopy] = useState('タイトルをここに入力');
  const [subCopy, setSubCopy] = useState('サブコピーやURLなどを入力してください');
  const [layout, setLayout] = useState<LayoutType>('center');
  const [bgImage, setBgImage] = useState(`https://picsum.photos/seed/ogp-default/1200/630`);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [overlayColor, setOverlayColor] = useState<'black' | 'white'>('black');
  const [textColor, setTextColor] = useState('#ffffff');
  const [mainFontSize, setMainFontSize] = useState(80);
  const [subFontSize, setSubFontSize] = useState(32);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [copied, setCopied] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle preview scaling
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const scale = containerWidth / 1200;
        setPreviewScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleRandomImage = () => {
    const seed = Math.floor(Math.random() * 10000);
    setBgImage(`https://picsum.photos/seed/${seed}/1200/630`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    try {
      // Use the style option to force scale: 1 during export without flickering the UI
      const dataUrl = await toJpeg(canvasRef.current, {
        quality: 0.9,
        width: 1200,
        height: 630,
        pixelRatio: 1,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      
      const link = document.createElement('a');
      link.download = `ogp-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const shareOnX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('OGP画像つくるくん | かんたんOGP作成ツール');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnFB = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const layoutStyles = {
    left: "items-start text-left pl-20",
    center: "items-center text-center px-10",
    right: "items-end text-right pr-20",
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      {/* Header */}
      <header className="h-auto lg:h-20 border-b border-zinc-200 bg-white flex flex-col lg:flex-row items-center justify-between px-6 py-4 lg:py-0 sticky top-0 z-30 shadow-sm">
        <div className="flex flex-col mb-4 lg:mb-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <ImageIcon className="text-white w-5 h-5" />
            </div>
            <h1 className="font-black text-xl tracking-tighter text-zinc-800">OGP画像つくるくん</h1>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium mt-1">
            SNSやブログに最適なOGP画像を数秒で作成できる無料ツール
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Share Buttons */}
          <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-full border border-zinc-100">
            <button 
              onClick={shareOnX}
              className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-600"
              title="Xでシェア"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button 
              onClick={shareOnFB}
              className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-600"
              title="Facebookでシェア"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button 
              onClick={copyLink}
              className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-600 relative"
              title="リンクをコピー"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:bg-zinc-300 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>JPEGで保存する</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row-reverse flex-1 overflow-hidden">
        {/* Preview Area (Top on Mobile, Right on Desktop) */}
        <section className="flex-1 bg-zinc-100 p-4 lg:p-12 flex flex-col items-center justify-start overflow-y-auto border-b lg:border-b-0 lg:border-l border-zinc-200">
          <div className="w-full max-w-4xl space-y-4 py-4">
            <div className="flex items-center justify-between text-zinc-400 px-2">
              <span className="text-xs font-bold flex items-center gap-1">
                <Layers className="w-3 h-3" />
                プレビュー
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">OGP Standard</span>
            </div>
            
            {/* The Canvas Container */}
            <div 
              ref={containerRef}
              className="relative aspect-[1200/630] w-full shadow-2xl rounded-xl overflow-hidden bg-white"
            >
              <div 
                ref={canvasRef}
                className="absolute top-0 left-0 w-[1200px] h-[630px] origin-top-left"
                style={{ 
                  transform: `scale(${previewScale})`,
                }}
              >
                {/* Background Image */}
                <img 
                  src={bgImage} 
                  alt="Background" 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay */}
                <div 
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    overlayColor === 'black' ? "bg-black" : "bg-white"
                  )}
                  style={{ opacity: overlayOpacity }}
                />

                {/* Content */}
                <div className={cn(
                  "absolute inset-0 flex flex-col justify-center p-20 z-10",
                  layoutStyles[layout]
                )}>
                  <motion.h3 
                    key={mainCopy + layout}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-black leading-[1.1] mb-6 drop-shadow-2xl whitespace-pre-wrap"
                    style={{ color: textColor, fontSize: `${mainFontSize}px` }}
                  >
                    {mainCopy}
                  </motion.h3>
                  <motion.p 
                    key={subCopy + layout}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-bold opacity-90 drop-shadow-xl"
                    style={{ color: textColor, fontSize: `${subFontSize}px` }}
                  >
                    {subCopy}
                  </motion.p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-4">
              <p className="text-zinc-400 text-[11px] font-medium">
                ※ プレビューは画面に合わせて自動で縮小されています。
              </p>
              
              {/* AdSense Placeholder */}
              <div className="w-full h-24 bg-zinc-200/50 border border-dashed border-zinc-300 rounded-lg flex items-center justify-center text-zinc-400 text-xs font-bold mt-4">
                AD SPACE
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar (Bottom on Mobile, Left on Desktop) */}
        <aside className="w-full lg:w-96 bg-white p-6 overflow-y-auto z-20 border-r border-zinc-100 flex flex-col">
          <div className="space-y-8 flex-1">
            {/* Layout */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <LayoutIcon className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-widest">レイアウト</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['left', 'center', 'right'] as LayoutType[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLayout(l)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95",
                      layout === l 
                        ? "border-brand bg-brand/5 text-brand" 
                        : "border-zinc-100 hover:border-zinc-200 text-zinc-400"
                    )}
                  >
                    {l === 'left' && <AlignLeft className="w-6 h-6" />}
                    {l === 'center' && <AlignCenter className="w-6 h-6" />}
                    {l === 'right' && <AlignRight className="w-6 h-6" />}
                    <span className="text-[10px] mt-2 font-bold uppercase tracking-tighter">{l}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Text Content */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <Type className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-widest">テキスト設定</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-black text-zinc-500 mb-1.5 block uppercase tracking-wider">メインコピー</label>
                  <textarea
                    value={mainCopy}
                    onChange={(e) => setMainCopy(e.target.value)}
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none h-28"
                    placeholder="メインコピーを入力..."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-zinc-500 mb-1.5 block uppercase tracking-wider">サブコピー</label>
                  <input
                    type="text"
                    value={subCopy}
                    onChange={(e) => setSubCopy(e.target.value)}
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    placeholder="サブコピーを入力..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">メイン文字サイズ</label>
                      <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">{mainFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      step="1"
                      value={mainFontSize}
                      onChange={(e) => setMainFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">サブ文字サイズ</label>
                      <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">{subFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="80"
                      step="1"
                      value={subFontSize}
                      onChange={(e) => setSubFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-zinc-500 mb-2 block uppercase tracking-wider">文字色</label>
                  <div className="flex flex-wrap gap-3">
                    {['#ffffff', '#000000', '#5ba4e5', '#f43f5e', '#10b981', '#f59e0b'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setTextColor(c)}
                        className={cn(
                          "w-9 h-9 rounded-full border-2 border-white shadow-md transition-transform active:scale-90",
                          textColor === c ? "ring-2 ring-brand ring-offset-2" : ""
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className={cn(
                      "relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center bg-zinc-100",
                      !['#ffffff', '#000000', '#5ba4e5', '#f43f5e', '#10b981', '#f59e0b'].includes(textColor) ? "ring-2 ring-brand ring-offset-2" : ""
                    )}>
                      <Pipette className="w-4 h-4 text-zinc-400 pointer-events-none z-10" />
                      <input 
                        type="color" 
                        value={textColor} 
                        onChange={(e) => setTextColor(e.target.value)}
                        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Background */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <ImageIcon className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-widest">背景画像設定</h2>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleRandomImage}
                    className="flex items-center justify-center gap-2 border-2 border-zinc-100 bg-white text-zinc-600 px-4 py-3 rounded-2xl text-xs font-bold hover:border-zinc-200 transition-all active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>おまかせ</span>
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-600 px-4 py-3 rounded-2xl text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>画像をアップ</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
 
                 <div className="p-3 bg-zinc-50 rounded-xl flex items-start gap-2 border border-zinc-100">
                   <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                   <div className="space-y-1.5">
                     <p className="text-[10px] text-zinc-500 leading-relaxed">
                       「おまかせ」ではUnsplashの高品質なパブリックドメイン画像を取得します。商用利用も可能です。
                     </p>
                     <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                       ※アップロードした画像はブラウザ内でのみ処理され、サーバーに保存されることはありません。プライバシー面でも安心してご利用いただけます。
                     </p>
                   </div>
                 </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">オーバーレイ設定</label>
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                      <button 
                        onClick={() => setOverlayColor('black')}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold rounded-md transition-all",
                          overlayColor === 'black' ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400"
                        )}
                      >
                        BLACK
                      </button>
                      <button 
                        onClick={() => setOverlayColor('white')}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold rounded-md transition-all",
                          overlayColor === 'white' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"
                        )}
                      >
                        WHITE
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">不透明度</label>
                    <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                      {Math.round(overlayOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-zinc-100 text-center">
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
              &copy; 2026 OGP画像つくるくん
            </p>
          </footer>
        </aside>
      </main>
    </div>
  );
}
