import React, {useState, useEffect} from 'react';
import {Link} from 'wouter';
import {Check, ArrowRight, Zap, CreditCard} from 'lucide-react';
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
import {ToastAction} from '@/components/ui/toast.tsx';
import {getOfferingById} from '@/data/offerings.ts';
import {goTalkToSarah} from '@/lib/sarah.ts';

// All user-controlled fields the form may post to /api/leads. The form
// schema is open: many fields are package-conditional, so optional is the
// honest shape rather than a discriminated union we'd have to refactor on
// every offering change.
type IntakeFormData = {
  package: string;
  businessName?: string;
  email?: string;
  industry?: string;
  ownerName?: string;
  phone?: string;
  estimatedProposalsPerMonth?: string;
  notes?: string;
  agentName?: string;
  addWebChatAgent?: boolean;
};

const isAgentPackage = (id: string) => id === 'basic' || id === 'premium';
const isSaasPackage = (id: string) =>
  id === 'gtm-ops-trial' || id === 'gtm-ops-plus' || id === 'gtm-ops-pro';

function OrderReceipt({successData}: {successData: IntakeFormData}) {
  const {toast} = useToast();
  const submittedOffering = getOfferingById(successData.package);
  const itemName =
    submittedOffering?.name?.toUpperCase() ?? successData.package.toUpperCase();
  const itemPriceString = submittedOffering?.price ?? '0';
  const cadence = submittedOffering?.priceCadence ?? 'one-time';
  const cadenceLabel = cadence === 'monthly' ? '/MO' : ' ONE-TIME';
  const canCheckout = submittedOffering && submittedOffering.price !== '0';
  const checkoutMutation = useMutation({
    async mutationFn() {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          package: successData.package,
          email: successData.email,
          businessName: successData.businessName,
        }),
      });
      const payload: {url?: string; error?: string} = await res.json();
      if (!res.ok || !payload.url) {
        throw new Error(payload.error || 'Stripe checkout is unavailable');
      }

      return {url: payload.url};
    },
    onSuccess(payload) {
      globalThis.location.assign(payload.url);
    },
    onError(error) {
      toast({
        title: 'Checkout unavailable',
        description: `${error.message}. We can send you an invoice manually.`,
        variant: 'destructive',
        duration: 10_000,
        action: (
          <ToastAction altText="Email Cody for a manual invoice" asChild>
            <a href="mailto:cody@wranngle.com?subject=Manual%20invoice%20request">
              Email Cody
            </a>
          </ToastAction>
        ),
      });
    },
  });

  return (
    <div className="bg-[#f0f0f0] p-6 rounded-sm shadow-xl max-w-sm mx-auto font-mono text-black relative border-t-8 border-[var(--s500)]">
      <div className="border-b-2 border-dashed border-gray-400 pb-4 mb-4 text-center">
        <div className="font-bold text-lg tracking-wider">WRANNGLE SYSTEMS</div>
        <div className="text-xs opacity-60">
          {canCheckout ? 'ORDER CONFIRMATION' : 'INTAKE SUMMARY'}
        </div>
      </div>

      <div className="space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span>REF:</span>
          <span>
            {new Date().toISOString().slice(0, 10).replaceAll('-', '')}-
            {successData.package.toUpperCase()}
          </span>
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
          <span>
            ${itemPriceString}
            {cadenceLabel}
          </span>
        </div>
        {submittedOffering?.monthlyAddon &&
          (() => {
            const {price, label} = submittedOffering.monthlyAddon;
            // Labels like '/yr annual plan' carry their own cadence; split it off
            // so the receipt reads "+ annual plan / $200/yr" instead of the
            // awkward "+ /yr annual plan / $200/MO".
            const cadenceMatch = /^(\/\w+)\s*(.*)$/.exec(label);
            const cleanLabel = cadenceMatch ? cadenceMatch[2] : label;
            const cadence = cadenceMatch ? cadenceMatch[1] : '/MO';
            return (
              <div className="flex justify-between opacity-70">
                <span>+ {cleanLabel}</span>
                <span>
                  ${price}
                  {cadence}
                </span>
              </div>
            );
          })()}
        {successData.addWebChatAgent && (
          <div className="flex justify-between opacity-70">
            <span>WEB CHAT AGENT</span>
            <span>$250/MO</span>
          </div>
        )}
        {canCheckout && (
          <>
            <div className="border-b border-dashed border-gray-400 my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>
                {cadence === 'monthly' ? 'DUE MONTHLY' : 'PROJECT TOTAL'}
              </span>
              <span>
                ${itemPriceString}
                {cadenceLabel}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="text-center text-xs space-y-2 bg-white/50 p-3 rounded">
        <div className="font-bold text-[var(--s500)]">
          {canCheckout ? 'PAYMENT PENDING' : 'REQUEST RECEIVED'}
        </div>
        <div>
          {canCheckout
            ? 'Confirmation will arrive at:'
            : 'We will follow up at:'}
        </div>
        <div className="font-bold">{successData.email}</div>
      </div>

      <div className="mt-6 text-[10px] text-center opacity-60">
        THANKS FOR REACHING OUT
      </div>

      {canCheckout && (
        <Button
          type="button"
          onClick={() => {
            checkoutMutation.mutate();
          }}
          className="w-full mt-6 bg-[var(--s500)] text-white hover:bg-[var(--s500)]/90 transition-colors"
          disabled={checkoutMutation.isPending}
        >
          <CreditCard size={14} className="mr-2" aria-hidden />
          {checkoutMutation.isPending
            ? 'OPENING STRIPE...'
            : cadence === 'monthly'
              ? 'SUBSCRIBE'
              : 'PAY WITH STRIPE'}
        </Button>
      )}

      <DialogClose asChild>
        <Button
          variant="outline"
          className="w-full mt-3 border-black/20 text-black hover:bg-black hover:text-white transition-colors"
        >
          CLOSE RECEIPT
        </Button>
      </DialogClose>
    </div>
  );
}

type IntakeFormProps = {
  selectedPackage: string;
  onSuccess?: () => void;
};

const IntakeForm = ({
  selectedPackage,
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional noop default; callers without a close-action can omit onSuccess.
  onSuccess = () => {},
}: IntakeFormProps) => {
  const [currentPackage, setCurrentPackage] = useState(selectedPackage);
  const offering = getOfferingById(currentPackage);
  const {register, handleSubmit, reset, setValue} = useForm<IntakeFormData>({
    defaultValues: {package: currentPackage},
    shouldUseNativeValidation: true,
  });
  const {toast} = useToast();
  const [successData, setSuccessData] = useState<IntakeFormData | undefined>(
    undefined,
  );
  // Only show the "Talk to Sarah vs form" mode-select for AI Agent packages
  // (Core/Elite) where Sarah genuinely demos what the user is buying. Website
  // and SaaS flows skip straight to the form — Sarah is irrelevant for them.
  const [startMode, setStartMode] = useState(
    isAgentPackage(selectedPackage) ? null : 'form',
  );

  useEffect(() => {
    setValue('package', currentPackage);
  }, [currentPackage, setValue]);

  const mutation = useMutation<unknown, Error, IntakeFormData>({
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
        title: 'Got it',
        description: 'We will be in touch with the next step.',
      });
      reset();
      onSuccess?.();
    },
    onError() {
      toast({
        title: 'Submission failed',
        description: 'Could not reach our servers. Please try again.',
        variant: 'destructive',
        duration: 10_000,
        action: (
          <ToastAction altText="Email Cody directly" asChild>
            <a href="mailto:cody@wranngle.com">Email Cody</a>
          </ToastAction>
        ),
      });
    },
  });

  if (successData) {
    return (
      <>
        <DialogTitle className="sr-only">Submission received</DialogTitle>
        <OrderReceipt successData={successData} />
      </>
    );
  }

  const isAgent = isAgentPackage(currentPackage);
  const isSaas = isSaasPackage(currentPackage);
  const itemName = isSaas
    ? `gtm_ops ${offering?.name ?? ''}`.trim()
    : (offering?.name ?? 'this');

  if (!startMode) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="brand-font text-2xl">
            How would you like to start?
          </DialogTitle>
          <DialogDescription>
            Test the live Sarah demo first, or send the details now. Either way,
            this starts with {itemName}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-5">
          <DialogClose asChild>
            <button
              type="button"
              onClick={() => {
                globalThis.setTimeout(() => {
                  goTalkToSarah();
                }, 150);
              }}
              className="text-left rounded-lg border border-[var(--s500)]/35 bg-[var(--s500)]/10 p-4 hover:border-[var(--s500)] transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider text-[var(--s500)]">
                    Talk it out with Sarah
                  </div>
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">
                    Open the ElevenLabs voice demo and hear the customer
                    experience before filling anything out.
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-[var(--s500)]" />
              </div>
            </button>
          </DialogClose>

          <button
            type="button"
            onClick={() => {
              setStartMode('form');
            }}
            className="text-left rounded-lg border border-current/15 p-4 hover:border-[var(--s500)] transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">
                  Fill out the form
                </div>
                <p className="text-xs opacity-70 mt-1 leading-relaxed">
                  Send the business details and we will follow up with the next
                  concrete step.
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0" />
            </div>
          </button>
        </div>
      </>
    );
  }

  if (isSaas) {
    const tierName = offering?.name ?? 'gtm_ops';
    const isTrial = currentPackage === 'gtm-ops-trial';
    return (
      <>
        <DialogHeader>
          <DialogTitle className="brand-font text-2xl">
            {isTrial ? 'Start your trial' : 'Request workspace setup'}
          </DialogTitle>
          <DialogDescription>
            {isTrial
              ? 'Email + company is all we need. No card. 14 days, then upgrade or walk.'
              : `Email + company is all we need. Cody handles ${tierName} workspace setup from there.`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-3 items-start">
          <Zap
            className="text-[var(--s500)] shrink-0 mt-0.5"
            size={18}
            aria-hidden
          />
          <div className="text-[12px] opacity-85 leading-relaxed">
            Workspace setup is currently manual. Cody emails your login back
            personally — usually within a few hours.
          </div>
        </div>

        <form
          onSubmit={handleSubmit((data) => {
            mutation.mutate(data);
          })}
          className="space-y-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="businessName">Company Name</Label>
            <Input
              id="businessName"
              className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
              {...register('businessName', {required: true})}
              placeholder="Acme Co"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
              {...register('email', {required: true})}
              placeholder="you@acme.co"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimatedProposalsPerMonth">
              Proposals you expect to generate per month (Optional)
            </Label>
            <Input
              id="estimatedProposalsPerMonth"
              className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
              {...register('estimatedProposalsPerMonth')}
              placeholder="10-50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Anything Cody should know? (Optional)</Label>
            <Textarea
              id="notes"
              className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit min-h-[80px]"
              {...register('notes')}
              placeholder="Use case, integrations, compliance needs, timeline..."
            />
          </div>
          <input
            type="hidden"
            {...register('package')}
            value={currentPackage}
          />
          <p className="text-[10px] opacity-60 leading-relaxed mt-1">
            By submitting, you agree to our{' '}
            <Link
              href="/privacy"
              className="underline hover:text-[var(--s500)]"
            >
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="underline hover:text-[var(--s500)]">
              Terms of Service
            </Link>
            .
          </p>
          <Button
            type="submit"
            className="w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? 'Submitting...'
              : isTrial
                ? 'Request trial access'
                : `Request ${tierName} setup`}
          </Button>
        </form>
      </>
    );
  }

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
          <Zap className="text-[var(--s500)] shrink-0" size={20} aria-hidden />
          <div>
            <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider mb-1">
              Recommended Upgrade
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed mb-2">
              Voice catches the after-hours phone call. <b>Web Chat</b> catches
              the visitor who would rather type. Two different intent surfaces —
              most trades leak leads on at least one.
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
        <>
          <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/10 rounded-lg flex gap-4 items-center">
            <div className="w-5 h-5 rounded-full bg-[var(--s500)] flex items-center justify-center text-white shrink-0">
              <Check size={12} strokeWidth={4} aria-hidden />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider">
                Elite Agent Selected
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Priority 24/7 Coverage + Web Chat Integration included.
              </p>
            </div>
          </div>
          <div className="mt-3 p-4 border border-[var(--v500)]/30 bg-[var(--v500)]/5 rounded-lg flex gap-4 items-start">
            <Zap
              className="text-[var(--v500)] shrink-0"
              size={20}
              aria-hidden
            />
            <div>
              <div className="text-xs font-bold text-[var(--v500)] uppercase tracking-wider mb-1">
                Worth Considering
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed mb-2">
                A Landing Page (7-day delivery) gives callers somewhere to
                convert before they pick up the phone — common companion to an
                Elite Agent setup.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCurrentPackage('landing-page');
                }}
                className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[var(--v500)] border border-[var(--v500)] px-3 py-1.5 rounded hover:bg-[var(--v500)] hover:text-white transition-all uppercase tracking-wide"
              >
                Switch to Landing Page ($900) <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </>
      )}

      {currentPackage === 'landing-page' && (
        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-4 items-start">
          <Zap className="text-[var(--s500)] shrink-0" size={20} aria-hidden />
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
        <>
          <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/10 rounded-lg flex gap-4 items-center">
            <div className="w-5 h-5 rounded-full bg-[var(--s500)] flex items-center justify-center text-white shrink-0">
              <Check size={12} strokeWidth={4} aria-hidden />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider">
                Business Site Selected
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Multi-page site with CMS, analytics, and lead capture
                automation.
              </p>
            </div>
          </div>
          <div className="mt-3 p-4 border border-[var(--v500)]/30 bg-[var(--v500)]/5 rounded-lg flex gap-4 items-start">
            <Zap
              className="text-[var(--v500)] shrink-0"
              size={20}
              aria-hidden
            />
            <div>
              <div className="text-xs font-bold text-[var(--v500)] uppercase tracking-wider mb-1">
                Worth Considering
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed mb-2">
                A Core Agent so the contact form is not your only after-hours
                capture. The form catches who emails; the agent catches who
                actually calls.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCurrentPackage('basic');
                }}
                className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[var(--v500)] border border-[var(--v500)] px-3 py-1.5 rounded hover:bg-[var(--v500)] hover:text-white transition-all uppercase tracking-wide"
              >
                Switch to Core Agent ($250/mo) <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </>
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
            placeholder="HVAC / Plumbing / Electrical / etc."
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
              placeholder="Alex, Jordan, Casey..."
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
            <Zap
              className="text-[var(--s500)] shrink-0"
              size={20}
              aria-hidden
            />
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
        <p className="text-[10px] opacity-60 leading-relaxed mt-1">
          By submitting, you agree to our{' '}
          <Link href="/privacy" className="underline hover:text-[var(--s500)]">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/terms" className="underline hover:text-[var(--s500)]">
            Terms of Service
          </Link>
          .
        </p>
        <Button
          type="submit"
          className="w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? 'Submitting...'
            : `Request ${offering?.name ?? 'setup'}`}
        </Button>
      </form>
    </>
  );
};

export default IntakeForm;
