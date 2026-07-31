import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, X, Mail } from 'lucide-react';
import { LETTER_PAGES } from '@/data/lettercontent';
import Image from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

// 示例音乐链接（用户可自行替换）
const MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

export default function LoveLetterPage() {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [envelopeAnimating, setEnvelopeAnimating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalPages = LETTER_PAGES.length;

  // 初始化音频
  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // 尝试自动播放
    const tryAutoPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // 浏览器阻止自动播放，等待用户手动开启
        setIsPlaying(false);
      }
    };
    tryAutoPlay();

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // 音量同步
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  }, [isPlaying]);

  const handleOpenEnvelope = () => {
    if (envelopeAnimating) return;
    setEnvelopeAnimating(true);
    // 信封打开动画时长约 1.2s，结束后进入阅读态
    setTimeout(() => {
      setEnvelopeOpen(true);
      setEnvelopeAnimating(false);
    }, 1400);
  };

  const goToNext = () => {
    if (currentPage >= totalPages - 1) return;
    setFlipDirection('next');
    setCurrentPage((p) => p + 1);
  };

  const goToPrev = () => {
    if (currentPage <= 0) return;
    setFlipDirection('prev');
    setCurrentPage((p) => p - 1);
  };

  const pageData = LETTER_PAGES[currentPage];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-stone-50">
      {/* 背景：淡雅渐变，米白 + 极淡青蓝 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-stone-100/70 via-stone-50 to-sky-50/50" />

      {/* 音乐控制 - 右上角悬浮 */}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md md:right-6 md:top-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-800"
          onClick={togglePlay}
          aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-stone-500 hover:bg-stone-100"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? '取消静音' : '静音'}
          >
            {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (muted && Number(e.target.value) > 0) setMuted(false);
            }}
            className="h-1 w-24 cursor-pointer accent-stone-500"
            aria-label="音量"
          />
        </div>
      </div>

      {/* 主内容区 */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!envelopeOpen ? (
            // ===== 信封封面 =====
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative w-full max-w-md"
            >
              {/* 信封主体 */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm shadow-xl">
                {/* 信封背面（底色）—— 米白色信封 */}
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200" />

                {/* 信封正面下半部 */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 z-20 h-1/2 origin-bottom bg-gradient-to-b from-stone-50 to-stone-100"
                  animate={envelopeAnimating ? { scaleY: 0 } : { scaleY: 1 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-stone-300/60" />
                </motion.div>

                {/* 信封左右两侧三角（从中间向两侧展开） */}
                <motion.div
                  className="absolute left-0 top-0 z-10 h-1/2 w-1/2 origin-left bg-gradient-to-br from-stone-100/90 to-stone-200/90"
                  style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
                  animate={envelopeAnimating ? { scaleX: 0 } : { scaleX: 1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute right-0 top-0 z-10 h-1/2 w-1/2 origin-right bg-gradient-to-bl from-stone-100/90 to-stone-200/90"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                  animate={envelopeAnimating ? { scaleX: 0 } : { scaleX: 1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />

                {/* 信封封口（上盖，从上往下翻） */}
                <motion.div
                  className="absolute left-0 right-0 top-0 z-30 h-1/2 origin-top bg-gradient-to-b from-stone-100 to-stone-200"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                  animate={envelopeAnimating ? { rotateX: -180, opacity: 0 } : { rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeIn' }}
                >
                  {/* 封口折痕线 */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-stone-300/50" />
                </motion.div>

                {/* 简约封口贴 —— 方形小封签 */}
                <motion.div
                  className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
                  animate={envelopeAnimating ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-stone-300 bg-white shadow-sm">
                    <Mail className="h-5 w-5 text-stone-500" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* 收信人地址线（装饰） */}
                <motion.div
                  className="absolute bottom-8 right-8 z-0 space-y-2"
                  animate={envelopeAnimating ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-px w-28 bg-stone-300/70" />
                  <div className="h-px w-20 bg-stone-300/50" />
                  <div className="h-px w-24 bg-stone-300/50" />
                </motion.div>

                {/* 信纸（从信封中滑出） */}
                <motion.div
                  className="absolute inset-x-6 top-6 z-0 bottom-6 rounded-sm bg-white shadow-inner"
                  animate={
                    envelopeAnimating
                      ? { y: '-65%', opacity: 1, scale: 1.02 }
                      : { y: '0%', opacity: 0.7, scale: 0.96 }
                  }
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-4 text-center">
                    <div className="font-serif text-lg tracking-wide text-stone-700">见字如面</div>
                    <div className="h-px w-10 bg-stone-300" />
                    <div className="text-xs text-stone-400">A Letter for You</div>
                  </div>
                </motion.div>
              </div>

              {/* 打开按钮 */}
              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={handleOpenEnvelope}
                  disabled={envelopeAnimating}
                  className="rounded-full bg-stone-800 px-8 text-white shadow-md hover:bg-stone-900"
                >
                  打开信件
                </Button>
              </motion.div>

              {/* 提示文字 */}
              <motion.p
                className="mt-4 text-center text-sm text-stone-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                一封写给你的信，慢慢读
              </motion.p>
            </motion.div>
          ) : (
            // ===== 信纸阅读态 =====
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative w-full max-w-2xl"
            >
              {/* 页码指示器 */}
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1 text-sm text-stone-500 shadow-sm backdrop-blur-sm">
                  <span className="h-1 w-1 rounded-full bg-stone-400" />
                  第 {currentPage + 1} 页 / 共 {totalPages} 页
                </span>
              </div>

              {/* 信纸容器 - 3D 透视 */}
              <div
                className="relative mx-auto w-full"
                style={{ perspective: '1500px' }}
              >
                <AnimatePresence mode="wait" custom={flipDirection}>
                  <motion.div
                    key={currentPage}
                    custom={flipDirection}
                    initial={{
                      opacity: 0,
                      rotateY: flipDirection === 'next' ? -90 : 90,
                      x: flipDirection === 'next' ? 40 : -40,
                    }}
                    animate={{ opacity: 1, rotateY: 0, x: 0 }}
                    exit={{
                      opacity: 0,
                      rotateY: flipDirection === 'next' ? 90 : -90,
                      x: flipDirection === 'next' ? -40 : 40,
                    }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    style={{ transformOrigin: flipDirection === 'next' ? 'right center' : 'left center' }}
                    className="w-full"
                  >
                    {/* 信纸卡片 —— 米白信纸质感 */}
                    <div className="relative overflow-hidden rounded-sm border border-stone-200 bg-gradient-to-b from-stone-50 via-white to-stone-50 shadow-xl">
                      {/* 信纸横线纹理 */}
                      <div
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(transparent, transparent 31px, rgba(120,120,130,0.12) 31px, rgba(120,120,130,0.12) 32px)',
                        }}
                      />
                      {/* 左侧装订线 */}
                      <div className="absolute left-8 top-0 bottom-0 w-px bg-stone-300/50 md:left-12" />
                      {/* 顶部留白横线 */}
                      <div className="absolute left-0 right-0 top-14 h-px bg-stone-200/60 md:top-16" />

                      <div className="relative px-6 py-10 md:px-16 md:py-14">
                        {/* 标题 */}
                        {pageData.title && (
                          <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-8 text-center font-serif text-xl font-medium tracking-wide text-stone-800 md:text-2xl"
                          >
                            {pageData.title}
                          </motion.h2>
                        )}

                        {/* 正文 + 图片混排 */}
                        <div className="space-y-5 text-base leading-loose text-stone-700 md:text-lg md:leading-loose">
                          {pageData.imageUrl && pageData.imagePosition === 'left' && (
                            <motion.figure
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="float-left mr-6 mb-4 w-40 cursor-pointer overflow-hidden rounded-sm border border-stone-200 shadow-sm md:w-52"
                              onClick={() => setLightboxSrc(pageData.imageUrl!)}
                            >
                              <Image
                                src={pageData.imageUrl}
                                alt={pageData.imageCaption || ''}
                                className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                              {pageData.imageCaption && (
                                <figcaption className="bg-stone-50 px-2 py-1 text-center text-xs text-stone-500">
                                  {pageData.imageCaption}
                                </figcaption>
                              )}
                            </motion.figure>
                          )}

                          {pageData.imageUrl && pageData.imagePosition === 'right' && (
                            <motion.figure
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="float-right ml-6 mb-4 w-40 cursor-pointer overflow-hidden rounded-sm border border-stone-200 shadow-sm md:w-52"
                              onClick={() => setLightboxSrc(pageData.imageUrl!)}
                            >
                              <Image
                                src={pageData.imageUrl}
                                alt={pageData.imageCaption || ''}
                                className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                              {pageData.imageCaption && (
                                <figcaption className="bg-stone-50 px-2 py-1 text-center text-xs text-stone-500">
                                  {pageData.imageCaption}
                                </figcaption>
                              )}
                            </motion.figure>
                          )}

                          {pageData.imageUrl && pageData.imagePosition === 'center' && (
                            <motion.figure
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="mx-auto mb-6 w-full max-w-sm cursor-pointer overflow-hidden rounded-sm border border-stone-200 shadow-sm"
                              onClick={() => setLightboxSrc(pageData.imageUrl!)}
                            >
                              <Image
                                src={pageData.imageUrl}
                                alt={pageData.imageCaption || ''}
                                className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                              {pageData.imageCaption && (
                                <figcaption className="bg-stone-50 px-2 py-1 text-center text-sm text-stone-500">
                                  {pageData.imageCaption}
                                </figcaption>
                              )}
                            </motion.figure>
                          )}

                          {pageData.paragraphs.map((p, i) => (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                              className="indent-8 font-serif"
                            >
                              {p}
                            </motion.p>
                          ))}
                        </div>

                        {/* 清除浮动 */}
                        <div className="clear-both" />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 翻页按钮 */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={goToPrev}
                  disabled={currentPage === 0}
                  className="rounded-full border-stone-200 bg-white/80 text-stone-600 backdrop-blur-sm hover:bg-stone-100 hover:text-stone-800 disabled:opacity-40"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  上一页
                </Button>

                {/* 页码点 */}
                <div className="flex items-center gap-2">
                  {LETTER_PAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFlipDirection(i > currentPage ? 'next' : 'prev');
                        setCurrentPage(i);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentPage
                          ? 'w-6 bg-stone-600'
                          : 'w-2 bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`跳转到第 ${i + 1} 页`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={goToNext}
                  disabled={currentPage === totalPages - 1}
                  className="rounded-full border-stone-200 bg-white/80 text-stone-600 backdrop-blur-sm hover:bg-stone-100 hover:text-stone-800 disabled:opacity-40"
                >
                  下一页
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 图片放大灯箱 */}
      <Dialog open={!!lightboxSrc} onOpenChange={(open) => !open && setLightboxSrc(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          <div className="relative">
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 z-10 h-10 w-10 rounded-full bg-white/90 text-stone-600 shadow-md hover:bg-white"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
            {lightboxSrc && (
              <Image
                src={lightboxSrc}
                alt="放大查看"
                className="max-h-[80vh] w-full rounded-sm object-contain shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
