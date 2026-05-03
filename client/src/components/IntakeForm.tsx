// @ts-nocheck
import React, {useState, useEffect} from 'react';
import {Check, ArrowRight, Zap} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog.tsx';
import {Input} from '@/components/ui/input.tsx';
import {Textarea} from '@/components/ui/textarea.tsx';
import {Label} from '@/components/ui/label.tsx';
import {useToast} from '@/hooks/use-toast.ts';
import {Button} from '@/components/ui/button.tsx';
import {getOfferingById} from '@/data/offerings.ts';

const isAgentPackage = (id) => id === 'basic' || id === 'premium';

function OrderReceipt({successData}) {
  const submittedOffering = getOfferingById(successData.package);
  const itemName =
    submittedOffering?.name?.toUpperCase() ?? successData.package.toUpperCase();
  const itemPrice = submittedOffering?.price ?? '0';

  return (
    <div className="bg-[#f0f0f0] p-6 rounded-sm shadow-xl max-w-sm mx-auto font-mono text-black relative border-t-8 border-[var(--s500)]">
      <div className="border-b-2 border-dashed border-gray-400 pb-4 mb-4 text-center">
        <div className="font-bold text-lg tracking-wider">WRANNGLE SYSTEMS</div>
        <div className="text-xs opacity-60">ORDER CONFIRMATION</div>
      </div>

      <div className="space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span>REF:</span>
          <span>{Math.random().toString(36).slice(2, 11).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>DATE:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="border-b border-dashed border-gray-400 my-2" />
        <div className="flex justify-between font-bold">
          <span>ITEM</span>
          <span>AMT</span>
        </div>
        <div className="flex justify-between">
          <span>{itemName}</span>
          <span>${itemPrice}</span>
        </div>
        {submittedOffering?.monthlyAddon && (
          <div className="flex justify-between opacity-70">
            <span>+ {submittedOffering.monthlyAddon.label}</span>
            <span>${submittedOffering.monthlyAddon.price}/mo</span>
          </div>
        )}
        {successData.addWebChatAgent && (
          <div className="flex justify-between opacity-70">
            <span>WEB CHAT AGENT</span>
            <span>$250/mo</span>
          </div>
        )}
        <div className="border-b border-dashed border-gray-400 my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>TOTAL</span>
          <span>${itemPrice}.00</span>
        </div>
      </div>

      <div className="text-center text-xs space-y-2 bg-white/50 p-3 rounded">
        <div className="font-bold text-[var(--s500)]">PAYMENT PENDING</div>
        <div>Invoice sent to:</div>
        <div className="font-bold">{successData.email}</div>
      </div>

      <div className="mt-6 text-[10px] text-center opacity-60">
        THANK YOU FOR YOUR BUSINESS
      </div>

      <DialogClose asChild>
        <Button
          variant="outline"
          className="w-full mt-6 border-black/20 text-black hover:bg-black hover:text-white transition-colors"
        >
          CLOSE RECEIPT
        </Button>
      </DialogClose>
    </div>
  );
}

const IntakeForm = ({selectedPackage, onSuccess}) => {
  const [currentPackage, setCurrentPackage] = useState(selectedPackage);
  const offering = getOfferingById(currentPackage);
  const {register, handleSubmit, reset, setValue} = useForm({
    defaultValues: {package: currentPackage},
  });
  const {toast} = useToast();
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    setValue('package', currentPackage);
  }, [currentPackage, setValue]);

  const mutation = useMutation({
    async mutationFn(data) {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit');
      return res.json();
    },
    onSuccess(_, variables) {
      setSuccessData(variables);
      toast({
        title: 'Order Received',
        description: 'Invoice generated successfully.',
      });
      reset();
      onSuccess?.();
    },
    onError(error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (successData) {
    return <OrderReceipt successData={successData} />;
  }

  const isAgent = isAgentPackage(currentPackage);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="brand-font text-2xl">
          {isAgent ? 'Agent Intake Form' : 'Project Intake Form'}
        </DialogTitle>
        <DialogDescription>
          {isAgent
            ? 'Tell us about your business to get your agent ready.'
            : 'Tell us about your business and project requirements.'}
        </DialogDescription>
      </DialogHeader>

      {currentPackage === 'basic' && (
        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-4 items-start">
          <Zap className="text-[var(--s500)] shrink-0" size={20} />
          <div>
            <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider mb-1">
              Recommended Upgrade
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed mb-2">
              Best Practice: 84% of trade businesses see 2x lead conversion when
              combining <b>Voice Agent</b> with <b>Web Chat</b>.
            </p>
            <button
              type="button"
              onClick={() => {
                setCurrentPackage('premium');
              }}
              className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[var(--s500)] border border-[var(--s500)] px-3 py-1.5 rounded hover:bg-[var(--s500)] hover:text-white transition-all uppercase tracking-wide"
            >
              Upgrade to Elite Agent (+$250/mo) <ArrowRight size={10} />
            </button>
          </div>
        </div>
      )}

      {currentPackage === 'premium' && (
        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/10 rounded-lg flex gap-4 items-center">
          <div className="w-5 h-5 rounded-full bg-[var(--s500)] flex items-center justify-center text-white shrink-0">
            <Check size={12} strokeWidth={4} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider">
              Elite Agent Secured
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Priority 24/7 Coverage + Web Chat Integration included.
            </p>
          </div>
        </div>
      )}

      {currentPackage === 'landing-page' && (
        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-4 items-start">
          <Zap className="text-[var(--s500)] shrink-0" size={20} />
          <div>
            <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider mb-1">
              Recommended Upgrade
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed mb-2">
              Need more than one page? The Business Site includes CMS,
              analytics, and automation.
            </p>
            <button
              type="button"
              onClick={() => {
                setCurrentPackage('business-site');
              }}
              className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[var(--s500)] border border-[var(--s500)] px-3 py-1.5 rounded hover:bg-[var(--s500)] hover:text-white transition-all uppercase tracking-wide"
            >
              Upgrade to Business Site <ArrowRight size={10} />
            </button>
          </div>
        </div>
      )}

      {currentPackage === 'business-site' && (
        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/10 rounded-lg flex gap-4 items-center">
          <div className="w-5 h-5 rounded-full bg-[var(--s500)] flex items-center justify-center text-white shrink-0">
            <Check size={12} strokeWidth={4} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider">
              Business Site Selected
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Multi-page site with CMS, analytics, and lead capture automation.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => {
          mutation.mutate(data);
        })}
        className="space-y-4 py-4"
      >
        <div className="grid gap-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
            {...register('businessName', {required: true})}
            placeholder="Apex Plumbing"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="industry">Industry / Trade</Label>
          <Input
            id="industry"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
            {...register('industry', {required: true})}
            placeholder="HVAC / Electrical / etc."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ownerName">Contact Person</Label>
          <Input
            id="ownerName"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
            {...register('ownerName', {required: true})}
            placeholder="John Doe"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
            {...register('email', {required: true})}
            placeholder="john@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
            {...register('phone', {required: true})}
            placeholder="(555) 000-0000"
          />
        </div>
        {isAgent && (
          <div className="grid gap-2">
            <Label htmlFor="agentName">
              What would you like to name your AI agent? (Optional)
            </Label>
            <Input
              id="agentName"
              className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
              {...register('agentName')}
              placeholder="Sarah, Max, Alex..."
              maxLength={50}
            />
            <p className="text-xs opacity-60">
              This will be the name of your AI assistant
            </p>
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit min-h-[100px]"
            {...register('notes')}
            placeholder={
              isAgent
                ? 'AI behavior, specific questions, current phone system details, etc.'
                : 'Project requirements, design preferences, existing website URL, etc.'
            }
          />
        </div>
        {!isAgent && (
          <div className="p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-4 items-start">
            <Zap className="text-[var(--s500)] shrink-0" size={20} />
            <div>
              <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider mb-1">
                Add-On: Web Chat Agent
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed mb-2">
                Capture leads 24/7 with an AI-powered web chat agent on your new
                site.
              </p>
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  {...register('addWebChatAgent')}
                  className="accent-[var(--s500)]"
                />
                <span>Add Web Chat Agent (+$250/mo)</span>
              </label>
            </div>
          </div>
        )}
        <input type="hidden" {...register('package')} value={currentPackage} />
        <Button
          type="submit"
          className="w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? 'Initializing...'
            : `Confirm ${offering?.name ?? 'Order'}`}
        </Button>
      </form>
    </>
  );
};

export default IntakeForm;
