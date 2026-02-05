'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Phone, Layout, Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';

// การตั้งค่าแบรนด์พื้นฐาน
const BRANDS = {
  MARUAY: {
    id: 'maruay',
    name: 'Maruay Thai',
    phone: '0450242121',
    logo: '/maruay-logo.png', // ตรวจสอบว่ามีไฟล์นี้ในโฟลเดอร์ public
    color: '#061E30',
  },
  PAD: {
    id: 'pad',
    name: 'PAD Thai Food',
    phone: '0435698885',
    logo: '/pad-logo.png', // ตรวจสอบว่ามีไฟล์นี้ในโฟลเดอร์ public
    color: '#061E30',
  }
};

export default function PosterMaker() {
  const [selectedBrand, setSelectedBrand] = useState(BRANDS.MARUAY);
  const [header, setHeader] = useState('');
  const [subHeader, setSubHeader] = useState('');
  const [description, setDescription] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [appVersion, setAppVersion] = useState('0000000000');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  // สร้าง Version Number จากวันที่และเวลา (ป้องกัน Error ตอน Build บน Server)
  useEffect(() => {
    const now = new Date();
    const yymmddhhmm = now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
    setAppVersion(yymmddhhmm);
  }, []);

  const handleDownloadImage = async () => {
    if (!posterRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { 
        quality: 1, 
        pixelRatio: 3, 
        backgroundColor: '#ffffff',
        cacheBust: true 
      });
      const link = document.createElement('a');
      link.download = `${selectedBrand.name}_Poster_${appVersion}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // แก้ไขปัญหา 'e.target' is possibly 'null' ที่เคยเจอ
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setCustomLogo(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row font-sans text-gray-900">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[400px] bg-white p-8 overflow-y-auto h-screen shadow-lg z-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 bg-[#061E30] rounded-lg text-white"><Layout size={24} /></div>
          <div>
            <h1 className="text-xl font-bold text-[#061E30] leading-none">Poster Creator</h1>
            <p className="text-[10px] text-gray-400 mt-1 font-mono uppercase tracking-tighter">v.{appVersion}</p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">1. Select Restaurant</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(BRANDS).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => { setSelectedBrand(brand); setCustomLogo(null); }}
                  className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${selectedBrand.id === brand.id ? 'border-[#061E30] bg-gray-50 text-[#061E30]' : 'border-gray-100 text-gray-400'}`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">2. Poster Details</label>
            <input 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#061E30] text-sm" 
              placeholder="Enter Main Header"
              value={header} 
              onChange={(e) => setHeader(e.target.value)}
            />
            <input 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#061E30] text-sm" 
              placeholder="Enter Sub-header"
              value={subHeader} 
              onChange={(e) => setSubHeader(e.target.value)}
            />
            <textarea 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#061E30] h-24 resize-none text-sm" 
              placeholder="Enter Description details..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>

          <section>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">3. Custom Branding</label>
            {!customLogo ? (
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#061E30] text-gray-400 flex flex-col items-center">
                <Upload size={20} className="mb-1" />
                <span className="text-[10px] font-bold uppercase">Upload PNG Logo</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2 border rounded-xl bg-gray-50">
                <span className="text-xs font-bold text-green-600 px-2">Custom Logo Active</span>
                <button onClick={() => setCustomLogo(null)} className="text-red-500 p-1"><X size={16}/></button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
          </section>

          <button onClick={handleDownloadImage} disabled={isDownloading} className="w-full py-4 bg-[#061E30] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform uppercase text-xs tracking-widest">
            {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
            Download PNG
          </button>
        </div>
      </div>

      {/* Poster Preview Area (A4 Size) */}
      <div className="flex-1 p-8 flex items-center justify-center overflow-auto bg-gray-200 min-h-screen">
        <div ref={posterRef} className="bg-white shadow-2xl flex flex-col border-[12px] border-[#061E30] shrink-0" style={{ width: '210mm', height: '297mm', padding: '20mm' }}>
          
          <div className="flex flex-col items-center mb-16">
            <div className="w-48 h-48 flex items-center justify-center mb-4">
              <img 
                src={customLogo || selectedBrand.logo}
                alt="Brand Logo" 
                className="max-w-full max-h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div className="h-1.5 w-24 bg-[#061E30] rounded-full" />
          </div>

          <div className="text-center space-y-6">
            <h1 className="text-[90px] font-black text-[#061E30] leading-none uppercase tracking-tighter italic">{header || "HEADING"}</h1>
            <h2 className="text-[32px] font-bold text-gray-400 uppercase tracking-[10px]">{subHeader || "SUB-HEADING"}</h2>
            <div className="pt-10 px-10 text-[24px] leading-relaxed text-gray-600 whitespace-pre-wrap font-medium">{description || "Announcement details..."}</div>
          </div>

          <div className="mt-auto border-t-4 border-[#061E30] pt-10 flex flex-col items-center">
             <div className="flex items-center gap-4 text-[32px] font-black text-[#061E30]">
                <Phone size={32} className="fill-[#061E30]" />
                {selectedBrand.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3')}
             </div>
             <p className="text-gray-400 font-bold tracking-[15px] uppercase mt-4">{selectedBrand.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}