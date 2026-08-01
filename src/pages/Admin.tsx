import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Search, Filter, Send, Loader2, ExternalLink, Download } from 'lucide-react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKRUokVBGc3Q_yhGnXnfE_teYQMDSm_yxs3EalZDBBX80EPpuE9FVxsf7_Lp4cUysSqw/exec';


interface RegistrationData {
  id: number;
  fullName: string;
  stageName: string;
  whatsapp: string;
  email: string;
  instagram: string;
  artistType: string;
  setDetails: string;
  upiTransactionId: string;
  screenshotUrl?: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);

  useEffect(() => {
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        // Handle case where data might not be an array if there's an error
        setRegistrations(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, []);

  const updateStatus = async (id: number, status: 'accepted' | 'rejected') => {
    const previous = [...registrations];
    const updated = registrations.map(reg => reg.id === id ? { ...reg, status } : reg);
    setRegistrations(updated);
    
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateStatus', id, status }),
      });
      const result = await response.json();
      if (!result.success) {
        setRegistrations(previous);
        alert('Failed to update status on server.');
      }
    } catch (e) {
      setRegistrations(previous);
      alert('Network error while updating status.');
    }
  };

  const sendWhatsAppTicket = (reg: RegistrationData) => {
    const message = `Hey *${reg.stageName}*! 🎉\n\nYour registration for *What the Mic 5.0* is APPROVED!\n\nHere are your Artist Pass details:\n- *Date:* 09 AUG 2026\n- *Time:* 3:00 PM\n- *Venue:* SKYHY LIVE\n- *Act:* ${reg.artistType}\n- *Txn ID:* ${reg.upiTransactionId}\n\nPlease bring a valid ID for venue entry. DO NOT SHARE this pass. See you at the stage! 🎤`;
    const encodedMessage = encodeURIComponent(message);
    // Remove any non-numeric characters from the WhatsApp number
    const phone = reg.whatsapp.replace(/\D/g, '');
    // Ensure it has country code (assuming India +91 if length is 10)
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  const generateAndShareTicket = async (reg: RegistrationData, actionType: 'share' | 'download' = 'share') => {
    try {
      document.body.style.cursor = 'wait';
      
      // Generate image using direct Canvas API to guarantee it works (bypassing all DOM/CSS/CORS bugs)
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not initialize Canvas 2D context");
      
      // Dark Background
      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, 1080, 1920);
      
      // Gold Inner Border
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 20;
      ctx.strokeRect(40, 40, 1000, 1840);
      
      // Accent Container
      ctx.fillStyle = '#171717';
      ctx.fillRect(80, 600, 920, 600);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, 600, 920, 600);
      
      // Top Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 40px sans-serif';
      // Manual letter spacing approximation for canvas
      ctx.fillText('O F F I C I A L   A R T I S T   P A S S', 540, 250);
      
      // Main Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 130px sans-serif';
      ctx.fillText('WHAT THE MIC', 540, 400);
      
      // Edition
      ctx.fillStyle = '#EF4444'; // Red-500
      ctx.font = 'italic bold 80px serif';
      ctx.fillText('5.0 Edition', 540, 500);
      
      // Artist Name
      ctx.textAlign = 'left';
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('A R T I S T   N A M E', 140, 700);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 100px sans-serif';
      let name = reg.stageName.toUpperCase();
      if (name.length > 15) name = name.substring(0, 15) + '...';
      ctx.fillText(name, 140, 830);
      
      // Divider Line
      ctx.beginPath();
      ctx.moveTo(140, 920);
      ctx.lineTo(940, 920);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Category & Venue
      ctx.fillStyle = '#9CA3AF'; // Gray-400
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('C A T E G O R Y', 140, 1000);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 45px sans-serif';
      ctx.fillText(reg.artistType.toUpperCase(), 140, 1070);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('V E N U E', 940, 1000);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 45px sans-serif';
      ctx.fillText('SKYHY LIVE', 940, 1070);
      
      // Bottom Row Details
      ctx.textAlign = 'left';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('DATE', 120, 1400);
      ctx.fillStyle = '#EF4444';
      ctx.font = '900 60px sans-serif';
      ctx.fillText('09 AUG 26', 120, 1480);
      
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('TIME', 540, 1400);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 60px sans-serif';
      ctx.fillText('3 PM', 540, 1480);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('TYPE', 960, 1400);
      ctx.fillStyle = '#D4AF37';
      ctx.font = '900 60px sans-serif';
      ctx.fillText('ARTIST', 960, 1480);
      
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Canvas toBlob returned null");

      const file = new File([blob], `WTM_Pass_${reg.stageName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
      
      if (actionType === 'download') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      const message = `Hey *${reg.stageName}*! 🎉\n\nYour registration for *What the Mic 5.0* is APPROVED!\n\nHere is your official Artist Pass. Please show this image at the venue entry. See you at the stage! 🎤`;

      const encodedMessage = encodeURIComponent(message);
      const phone = String(reg.whatsapp).replace(/\D/g, '');
      const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

      try {
        if (!navigator.clipboard) throw new Error("Clipboard API not available");
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert("Ticket image copied to clipboard! \n\nWhatsApp will now open. Just paste (Ctrl+V) into the chat to attach the ticket.");
      } catch (clipboardErr) {
        console.warn("Clipboard fallback triggered", clipboardErr);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Ticket image downloaded! \n\nWhatsApp will now open. Please manually attach the downloaded image.");
      }
      
      window.open(whatsappUrl, '_blank');
      
    } catch (err) {
      console.error("Error generating ticket:", err);
      alert("Error generating ticket: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const filtered = registrations.filter(r => 
    r.stageName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.artistType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090909] p-4 md:p-10 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase text-[#D4AF37] mb-2 font-heading tracking-tight">WTM 5.0 Admin</h1>
            <p className="text-gray-400">Manage artist registrations and payments.</p>
          </div>
          
          <div className="mt-6 md:mt-0 flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search artists..." 
                className="w-full bg-[#171717] border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:border-[#D4AF37] focus:outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-[#171717] border border-white/10 p-2 rounded-lg hover:border-[#D4AF37] transition-colors">
              <Filter size={20} className="text-gray-400" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 border-l-4 border-l-blue-500">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Applications</h3>
            <p className="text-4xl font-black">{registrations.length}</p>
          </div>
          <div className="glass-card p-6 border-l-4 border-l-green-500">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Accepted</h3>
            <p className="text-4xl font-black text-green-500">{registrations.filter(r => r.status === 'accepted').length}</p>
          </div>
          <div className="glass-card p-6 border-l-4 border-l-yellow-500">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Pending Review</h3>
            <p className="text-4xl font-black text-yellow-500">{registrations.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-white/5">
                  <th className="p-4 font-bold">Artist</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Act Details</th>
                  <th className="p-4 font-bold">Screenshot</th>
                  <th className="p-4 font-bold">Payment</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                        <p>Loading registrations from database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg) => (
                    <motion.tr 
                      key={reg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-bold text-lg text-white">{reg.stageName}</p>
                        <p className="text-xs text-gray-400">{reg.fullName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{reg.whatsapp}</p>
                        <p className="text-xs text-gray-400 truncate w-32" title={reg.email}>{reg.email}</p>
                        <a href={reg.instagram} target="_blank" rel="noreferrer" className="text-xs text-[#D4AF37] hover:underline">Instagram</a>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => setSelectedRegistration(reg)}
                          className="text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border border-[#D4AF37]/30"
                        >
                          Review App <ExternalLink size={14} />
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 bg-white/10 rounded text-xs font-medium mb-1">
                          {reg.artistType}
                        </span>
                        <p className="text-xs text-gray-400 line-clamp-2 w-48" title={reg.setDetails}>{reg.setDetails}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-xs bg-black/50 px-2 py-1 rounded inline-block text-gray-300">
                          {reg.upiTransactionId}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          reg.status === 'accepted' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                          reg.status === 'rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {reg.status !== 'accepted' && (
                            <button 
                              onClick={() => updateStatus(reg.id, 'accepted')}
                              className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 hover:text-green-500 transition-colors"
                              title="Accept"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {reg.status !== 'rejected' && (
                            <button 
                              onClick={() => updateStatus(reg.id, 'rejected')}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          )}
                          {reg.status === 'accepted' && (
                            <>
                              <button 
                                onClick={() => generateAndShareTicket(reg, 'download')}
                                className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors ml-2"
                                title="Download Ticket Image"
                              >
                                <Download size={16} />
                              </button>
                              <button 
                                onClick={() => generateAndShareTicket(reg, 'share')}
                                className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition-colors ml-2"
                                title="Generate and Send Ticket via WhatsApp"
                              >
                                <Send size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedRegistration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedRegistration(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#171717] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#171717]/95 backdrop-blur-md z-10">
                <h2 className="text-2xl font-black uppercase text-[#D4AF37]">Application Details</h2>
                <button onClick={() => setSelectedRegistration(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Artist Info</h3>
                    <div className="bg-black/30 p-4 rounded-xl space-y-3 border border-white/5">
                      <div><span className="text-gray-400 text-xs uppercase w-24 inline-block">Stage Name:</span> <span className="font-bold text-white text-lg">{selectedRegistration.stageName}</span></div>
                      <div><span className="text-gray-400 text-xs uppercase w-24 inline-block">Full Name:</span> <span className="text-gray-300">{selectedRegistration.fullName}</span></div>
                      <div><span className="text-gray-400 text-xs uppercase w-24 inline-block">DOB:</span> <span className="text-gray-300">{selectedRegistration.dob}</span></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Details</h3>
                    <div className="bg-black/30 p-4 rounded-xl space-y-3 border border-white/5">
                      <div><span className="text-gray-400 text-xs uppercase w-24 inline-block">WhatsApp:</span> <span className="text-gray-300">{selectedRegistration.whatsapp}</span></div>
                      <div><span className="text-gray-400 text-xs uppercase w-24 inline-block">Email:</span> <span className="text-gray-300">{selectedRegistration.email}</span></div>
                      <div><span className="text-gray-400 text-xs uppercase w-24 inline-block">Instagram:</span> <a href={selectedRegistration.instagram} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">{selectedRegistration.instagram}</a></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Act Description</h3>
                    <div className="bg-black/30 p-4 rounded-xl space-y-3 border border-white/5">
                      <div><span className="text-gray-400 text-xs uppercase w-24 inline-block mb-2">Category:</span> <span className="inline-block px-2 py-1 bg-white/10 rounded text-xs font-medium border border-white/10">{selectedRegistration.artistType}</span></div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase block mb-2">Set Details:</span> 
                        <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{selectedRegistration.setDetails}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Verification</h3>
                    <div className="bg-black/30 p-4 rounded-xl mb-4 border border-white/5 flex items-center justify-between">
                      <span className="text-gray-400 text-xs uppercase">Transaction ID:</span> 
                      <span className="font-mono text-white font-bold bg-black px-3 py-1.5 rounded-lg border border-white/10">{selectedRegistration.upiTransactionId}</span>
                    </div>
                    {selectedRegistration.screenshotUrl ? (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center min-h-[300px] relative group">
                        <img 
                          src={selectedRegistration.screenshotUrl.includes('drive.google.com') 
                               ? `https://drive.google.com/thumbnail?id=${selectedRegistration.screenshotUrl.match(/\/d\/(.*?)\//)?.[1] || selectedRegistration.screenshotUrl.split('id=')[1]}&sz=w1000` 
                               : selectedRegistration.screenshotUrl} 
                          alt="Payment Screenshot" 
                          className="w-full h-auto max-h-[450px] object-contain"
                          onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <iframe 
                          src={selectedRegistration.screenshotUrl.replace('/view', '/preview')} 
                          className="w-full h-[450px] hidden" 
                          title="Screenshot Viewer"
                        ></iframe>
                        <a href={selectedRegistration.screenshotUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-lg text-white hover:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={20} />
                        </a>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/20 p-10 flex flex-col items-center justify-center text-gray-500 h-[300px]">
                        <span className="text-sm uppercase tracking-wider font-bold mb-2">No Screenshot</span>
                        <span className="text-xs">User did not upload payment proof</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 pt-4 border-t border-white/10">
                     {selectedRegistration.status !== 'accepted' && (
                       <button 
                         onClick={() => { updateStatus(selectedRegistration.id, 'accepted'); setSelectedRegistration(null); }}
                         className="flex-1 py-4 rounded-xl bg-green-500/10 text-green-500 font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-colors border border-green-500/30"
                       >
                         Accept Application
                       </button>
                     )}
                     {selectedRegistration.status !== 'rejected' && (
                       <button 
                         onClick={() => { updateStatus(selectedRegistration.id, 'rejected'); setSelectedRegistration(null); }}
                         className="flex-1 py-4 rounded-xl bg-red-500/10 text-red-500 font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-colors border border-red-500/30"
                       >
                         Reject
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
