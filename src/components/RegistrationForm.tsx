import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from './ui/Button';
import { CheckCircle2, Upload, AlertCircle, Loader2 } from 'lucide-react';
import upiQr from '../assets/upi_qr.jpeg';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKRUokVBGc3Q_yhGnXnfE_teYQMDSm_yxs3EalZDBBX80EPpuE9FVxsf7_Lp4cUysSqw/exec';

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  stageName: z.string().min(1, "Stage name is required"),
  whatsapp: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits"),
  phone: z.string().optional(),
  email: z.string().email("Valid email is required"),
  instagram: z.string().min(1, "Instagram link is required"),
  
  artistType: z.string().min(1, "Select artist type"),
  setDetails: z.string().min(10, "Please provide some details about your set"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a complete date of birth").refine(val => {
    const dob = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 21;
  }, "Oops under age"),
  ageDeclaration: z.boolean().refine(val => val === true, "You must declare you are 21+"),
  
  upiTransactionId: z.string().min(5, "Transaction ID is required"),
  paymentScreenshot: z.any()
});

type FormValues = z.infer<typeof formSchema>;

const ARTIST_TYPES = [
  { id: 'music', label: '🎸 Music' },
  { id: 'singing', label: '🎤 Singing' },
  { id: 'rap', label: '🔥 Rap' },
  { id: 'beatboxing', label: '🎧 Beatboxing' },
  { id: 'poetry', label: '📖 Poetry / Spoken Word' },
  { id: 'comedy', label: '🎭 Stand-up Comedy' },
  { id: 'dance', label: '💃 Dance' },
  { id: 'storytelling', label: '🗣️ Storytelling' },
  { id: 'other', label: '✨ Other' }
];

const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const months = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 65 }, (_, i) => String(currentYear - 16 - i));

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [ticketData, setTicketData] = useState<FormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors }, trigger, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      artistType: '',
      ageDeclaration: false
    }
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'stageName', 'whatsapp', 'email', 'instagram'];
    } else if (step === 2) {
      fieldsToValidate = ['artistType', 'setDetails', 'dob', 'ageDeclaration'];
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setStep(s => s - 1);
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      let screenshotBase64 = '';
      let screenshotMimeType = '';
      
      if (data.paymentScreenshot && data.paymentScreenshot.length > 0) {
        const file = data.paymentScreenshot[0];
        screenshotBase64 = await getBase64(file);
        screenshotMimeType = file.type;
      }

      const payload = {
        action: 'submit',
        ...data,
        screenshotBase64,
        screenshotMimeType
      };

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Server response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Non-JSON response received:", responseText);
        throw new Error("Invalid response from server. Check console.");
      }
      
      if (result.success) {
        setTicketData({ ...data, upiTransactionId: data.upiTransactionId || 'Pending' });
        setStep(4);
      } else {
        alert('Error saving registration: ' + (result.error || 'Unknown error'));
        console.error('API Error:', result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFile = watch('paymentScreenshot');

  useEffect(() => {
    if (selectedFile && selectedFile.length > 0) {
      setIsExtracting(true);
      const file = selectedFile[0];
      
      import('tesseract.js').then(Tesseract => {
        Tesseract.recognize(file, 'eng')
          .then(({ data: { text } }) => {
            const match = text.match(/\b\d{12}\b/);
            if (match) {
              setValue('upiTransactionId', match[0], { shouldValidate: true });
            }
          })
          .catch(console.error)
          .finally(() => setIsExtracting(false));
      });
    }
  }, [selectedFile, setValue]);

  return (
    <div className="w-full">
      {step < 4 && (
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">
            Step {step} of 3 — {step === 1 ? 'Your Details' : step === 2 ? 'Your Act' : 'Grab Your Pass'}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 md:p-10"
          >
            <h2 className="text-3xl font-bold mb-2 uppercase text-[#D4AF37]">WHO'S ON THE MIC?</h2>
            <p className="text-gray-400 mb-8">Perform. Be seen. Get recognized. Start with who you are — this is how we'll send your pass.</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">FULL NAME <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Your real name" {...register('fullName')} className="w-full" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">STAGE / ARTIST NAME <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="What the crowd will chant" {...register('stageName')} className="w-full" />
                  {errors.stageName && <p className="text-red-500 text-xs mt-1">{errors.stageName.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">WHATSAPP NUMBER (FOR TICKET) <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="10-digit WhatsApp number" maxLength={10} {...register('whatsapp')} className="w-full" />
                  <p className="text-[#D4AF37] text-[10px] mt-1 font-medium">We will send your Artist Pass here.</p>
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">PHONE (IF DIFFERENT)</label>
                  <input type="tel" placeholder="Optional" {...register('phone')} className="w-full" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">EMAIL <span className="text-red-500">*</span></label>
                <input type="email" placeholder="you@email.com" {...register('email')} className="w-full" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">INSTAGRAM PROFILE LINK <span className="text-red-500">*</span></label>
                <input type="url" placeholder="https://instagram.com/yourhandle" {...register('instagram')} className="w-full" />
                {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram.message}</p>}
              </div>
            </div>
            
            <div className="mt-10">
              <Button fullWidth type="button" onClick={nextStep}>CONTINUE &rarr;</Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 md:p-10"
          >
            <h2 className="text-3xl font-bold mb-2 uppercase text-[#D4AF37]">YOUR ACT</h2>
            <p className="text-gray-400 mb-8">Perform in front of well-known faces of the industry. Pick your lane and tell us your set.</p>
            
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-4">TYPE OF ARTIST <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  <Controller
                    name="artistType"
                    control={control}
                    render={({ field }) => (
                      <>
                        {ARTIST_TYPES.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => field.onChange(type.id)}
                            className={`px-4 py-2 rounded-full border transition-all ${
                              field.value === type.id 
                                ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold' 
                                : 'bg-[#171717] border-white/10 text-white hover:border-white/30'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </>
                    )}
                  />
                </div>
                {errors.artistType && <p className="text-red-500 text-xs mt-2">{errors.artistType.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">YOUR SET / TRACKS <span className="text-red-500">*</span></label>
                <textarea 
                  rows={4}
                  placeholder="e.g. 2 original tracks — 'Midnight' & 'Rewind'. ~6 min set." 
                  {...register('setDetails')} 
                  className="w-full resize-none" 
                />
                {errors.setDetails && <p className="text-red-500 text-xs mt-1">{errors.setDetails.message}</p>}
              </div>
              
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-xl font-bold uppercase mb-2">AGE CHECK</h3>
                <p className="text-gray-400 text-sm mb-6">This stage is strictly 21+. ID verification is done at venue entry.</p>
                
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">DATE OF BIRTH <span className="text-red-500">*</span></label>
                  <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => {
                      const [year = '', month = '', day = ''] = (field.value || '').split('-');
                      
                      return (
                        <div className="flex gap-3">
                          <select 
                            className="flex-1 bg-[#171717] border border-white/10 rounded-lg py-3 px-2 md:px-4 focus:border-[#D4AF37] focus:outline-none transition-colors text-white appearance-none cursor-pointer text-center"
                            value={day}
                            onChange={(e) => {
                              const newDay = e.target.value;
                              field.onChange(`${year || 'YYYY'}-${month || 'MM'}-${newDay}`);
                            }}
                          >
                            <option value="" disabled hidden>Day</option>
                            <option value="DD" disabled hidden>DD</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          
                          <select 
                            className="flex-1 bg-[#171717] border border-white/10 rounded-lg py-3 px-2 md:px-4 focus:border-[#D4AF37] focus:outline-none transition-colors text-white appearance-none cursor-pointer text-center"
                            value={month}
                            onChange={(e) => {
                              const newMonth = e.target.value;
                              field.onChange(`${year || 'YYYY'}-${newMonth}-${day || 'DD'}`);
                            }}
                          >
                            <option value="" disabled hidden>Month</option>
                            <option value="MM" disabled hidden>MM</option>
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                          
                          <select 
                            className="flex-1 bg-[#171717] border border-white/10 rounded-lg py-3 px-2 md:px-4 focus:border-[#D4AF37] focus:outline-none transition-colors text-white appearance-none cursor-pointer text-center"
                            value={year}
                            onChange={(e) => {
                              const newYear = e.target.value;
                              field.onChange(`${newYear}-${month || 'MM'}-${day || 'DD'}`);
                            }}
                          >
                            <option value="" disabled hidden>Year</option>
                            <option value="YYYY" disabled hidden>YYYY</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      );
                    }}
                  />
                  {errors.dob && <p className="text-red-500 text-xs mt-2">{errors.dob.message}</p>}
                </div>
                
                <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-start gap-3">
                  <Controller
                    name="ageDeclaration"
                    control={control}
                    render={({ field }) => (
                      <input 
                        type="checkbox" 
                        id="ageDeclaration"
                        className="mt-1 w-5 h-5 accent-red-500"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <div>
                    <label htmlFor="ageDeclaration" className="text-sm text-gray-300">
                      Enter your date of birth above to confirm eligibility.<br/>
                      <span className="text-white font-medium mt-1 inline-block">I declare I am 21 years or older and will carry a valid photo ID for verification at venue entry.</span>
                    </label>
                    {errors.ageDeclaration && <p className="text-red-500 text-xs mt-1">{errors.ageDeclaration.message}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex gap-4">
              <Button type="button" variant="secondary" onClick={prevStep} className="w-1/3">&larr; BACK</Button>
              <Button type="button" onClick={nextStep} className="w-2/3">CONTINUE &rarr;</Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.form 
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 md:p-10"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="text-3xl font-bold mb-2 uppercase text-[#D4AF37]">GRAB YOUR PASS</h2>
            <p className="text-gray-400 mb-8">Limited slots. High impact. Pay the entry fee, then enter your transaction ID and upload the screenshot.</p>
            
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 rounded-xl p-6 mb-8 flex justify-between items-center">
              <span className="font-bold uppercase tracking-widest text-sm">WHAT THE MIC 5.0 — ENTRY</span>
              <span className="text-3xl font-bold font-serif text-[#D4AF37]">₹789</span>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <label className="block text-xs font-bold uppercase tracking-wider mb-4 text-gray-400">PAY ENTRY FEE (₹789)</label>
                
                <div className="flex flex-col gap-3 max-w-sm mx-auto mb-6">
                  <a 
                    href="phonepe://pay?pa=YOUR_UPI_ID@bank&pn=WhatTheMic&am=789&cu=INR" 
                    className="bg-[#5f259f] hover:bg-[#4a1c7e] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Pay with PhonePe
                  </a>
                  <a 
                    href="gpay://upi/pay?pa=YOUR_UPI_ID@bank&pn=WhatTheMic&am=789&cu=INR" 
                    className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-300"
                  >
                    Pay with Google Pay
                  </a>
                  <button 
                    type="button" 
                    onClick={() => setShowQR(!showQR)} 
                    className="bg-[#171717] border border-white/20 hover:border-[#D4AF37] text-white font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    {showQR ? "Hide QR Code" : "Show QR Code (Scan to Pay)"}
                  </button>
                </div>

                <AnimatePresence>
                  {showQR && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white p-2 rounded-xl inline-block shadow-[0_0_30px_rgba(212,175,55,0.15)] mb-4 mt-2">
                        <img src={upiQr} alt="UPI QR Code" className="w-56 h-56 object-contain rounded-lg" />
                      </div>
                      <p className="text-xs text-[#D4AF37] flex items-center justify-center gap-2 font-medium bg-[#D4AF37]/10 p-3 rounded-lg border border-[#D4AF37]/20 mx-auto max-w-md text-left md:text-center mb-4">
                        <AlertCircle size={24} className="flex-shrink-0" />
                        Scan to pay the organizer. You can also save this QR and upload it in your UPI app to pay.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="border-t border-white/10 pt-8 mt-8">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">PAYMENT SCREENSHOT <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-[#D4AF37]/50 hover:bg-white/5 transition-all cursor-pointer mb-4 relative overflow-hidden group">
                  <input type="file" accept="image/*" {...register('paymentScreenshot')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isExtracting} />
                  
                  {isExtracting ? (
                    <>
                      <Loader2 className="mb-4 text-[#D4AF37] animate-spin" size={32} />
                      <p className="font-bold uppercase tracking-wider mb-1 text-sm text-[#D4AF37]">
                        READING TRANSACTION ID...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className={`mb-4 transition-colors ${selectedFile && selectedFile.length > 0 ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-[#D4AF37]'}`} size={32} />
                      <p className={`font-bold uppercase tracking-wider mb-1 text-sm transition-colors ${selectedFile && selectedFile.length > 0 ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'}`}>
                        {selectedFile && selectedFile.length > 0 ? selectedFile[0].name : "TAP TO CHOOSE YOUR SCREENSHOT"}
                      </p>
                    </>
                  )}
                  <p className="text-xs text-gray-500 mt-2">PNG / JPG · SHOWING AMOUNT, DATE & TXN ID CLEARLY</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">UPI TRANSACTION / REFERENCE ID <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="12-digit UPI ref — auto-fills after upload, or type it" {...register('upiTransactionId')} className="w-full font-mono text-center text-lg tracking-widest bg-black/50" />
                  {errors.upiTransactionId && <p className="text-red-500 text-xs mt-1 text-center">{errors.upiTransactionId.message}</p>}
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex gap-4">
              <Button type="button" variant="secondary" onClick={prevStep} className="w-1/3" disabled={isSubmitting}>&larr; BACK</Button>
              <Button type="submit" className="w-2/3 flex items-center justify-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={18} /> SUBMITTING...</>
                ) : (
                  <>SUBMIT REGISTRATION &rarr;</>
                )}
              </Button>
            </div>
          </motion.form>
        )}
        
        {step === 4 && ticketData && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center py-10"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 mb-8 relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-green-500/20" style={{ animationDuration: '2s' }}></div>
              <CheckCircle2 size={48} className="text-green-500 relative z-10" />
            </div>
            
            <h2 className="text-5xl font-black mb-4 uppercase text-gradient drop-shadow-lg">FORM SUBMITTED</h2>
            <p className="text-xl text-gray-300 mb-12 max-w-md mx-auto">
              Your registration for <span className="text-white font-bold">{ticketData.stageName}</span> has been received.
            </p>
            
            <div className="glass-card p-8 max-w-md mx-auto border-t-4 border-t-[#D4AF37]">
               <h3 className="text-xl font-bold mb-4 uppercase">What's Next?</h3>
               <p className="text-gray-400 leading-relaxed">
                  Our team will verify your payment details and application. 
                  <br/><br/>
                  <strong className="text-white text-lg block my-2">Check your WhatsApp soon!</strong> 
                  Once verified, you will receive your official Artist Pass directly on WhatsApp.
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
