import React, {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {Link} from 'wouter';
import {Check, ArrowRight, Zap, CreditCard, Sparkles} from 'lucide-react';
import {
  useForm,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from 'react-hook-form';
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
};

const isAgentPackage = (id: string) => id === 'basic' || id === 'premium';
const isSaasPackage = (id: string) => id === 'gtm-ops-pro';
const noopOnSuccess = () => undefined;

type IntakeFormFieldsProps = {
  currentPackage: string;
  register: UseFormRegister<IntakeFormData>;
  handleSubmit: UseFormHandleSubmit<IntakeFormData>;
  onSubmit: (data: IntakeFormData) => void;
  isPending: boolean;
};

function ReceiptTotalLine({
  canCheckout,
  cadence,
  itemPriceString,
  cadenceLabel,
}: {
  canCheckout: boolean;
  cadence: 'monthly' | 'one-time';
  itemPriceString: string;
  cadenceLabel: string;
}) {
  if (!canCheckout) return null;

  return (
    <>
      <div className="border-b border-dashed border-gray-400 my-2" />
      <div className="flex justify-between font-bold text-lg">
        <span>{cadence === 'monthly' ? 'DUE MONTHLY' : 'PROJECT TOTAL'}</span>
        <span>
          ${itemPriceString}
          {cadenceLabel}
        </span>
      </div>
    </>
  );
}

function ReceiptCheckoutButton({
  canCheckout,
  isPending,
  cadence,
  onCheckout,
}: {
  canCheckout: boolean;
  isPending: boolean;
  cadence: 'monthly' | 'one-time';
  onCheckout: () => void;
}) {
  if (!canCheckout) return null;

  const label = isPending
    ? 'OPENING STRIPE...'
    : cadence === 'monthly'
      ? 'SUBSCRIBE'
      : 'PAY WITH STRIPE';

  return (
    <Button
      type="button"
      onClick={onCheckout}
      className="w-full mt-6 bg-[var(--s500)] text-white hover:bg-[var(--s500)]/90 transition-colors"
      disabled={isPending}
    >
      <CreditCard size={14} className="mr-2" aria-hidden />
      {label}
    </Button>
  );
}

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
        <ReceiptTotalLine
          canCheckout={Boolean(canCheckout)}
          cadence={cadence}
          itemPriceString={itemPriceString}
          cadenceLabel={cadenceLabel}
        />
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

      <ReceiptCheckoutButton
        canCheckout={Boolean(canCheckout)}
        isPending={checkoutMutation.isPending}
        cadence={cadence}
        onCheckout={() => {
          checkoutMutation.mutate();
        }}
      />

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

function LegalNotice() {
  return (
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
  );
}

function AgentDemoSecondaryAction() {
  return (
    <DialogClose asChild>
      <button
        type="button"
        onClick={() => {
          globalThis.setTimeout(() => {
            goTalkToSarah();
          }, 150);
        }}
        className="mt-4 inline-flex w-fit items-center gap-2 rounded-md border border-current/15 px-3 py-2 text-[11px] font-bold uppercase tracking-wider opacity-80 transition-colors hover:border-[var(--s500)] hover:text-[var(--s500)]"
      >
        <Sparkles size={13} className="sarah-glimmer" aria-hidden />
        Hear Sarah first
      </button>
    </DialogClose>
  );
}

/**
 * Pre-modal gate shown before the typed intake form. Sarah is Wranngle's
 * own lead-intake agent — not just a product demo — so the gate
 * frames a live call as the open-ended way to scope the project: she asks
 * everything the form asks and more, in conversation. Two paths:
 *   1. Scope it with Sarah — opens the ElevenLabs voice widget for a live
 *      intake call (the user can still fill the form afterwards).
 *   2. Continue to form — dismisses the gate and renders the typed form.
 *
 * Used by all packages so the intake-call option is consistent across AI
 * agent and gtm_ops flows (round-2 feedback F006 + F016 + F027).
 */
function SarahPreModalGate({
  tierName,
  onContinue,
}: {
  tierName: string;
  onContinue: () => void;
}) {
  return (
    <div className="py-3" data-testid="sarah-pre-modal">
      <DialogHeader>
        <DialogTitle className="brand-font text-2xl flex items-center gap-2">
          <Sparkles
            size={18}
            className="text-[var(--s500)] sarah-glimmer"
            aria-hidden
          />
          Scope it with Sarah first?
        </DialogTitle>
        <DialogDescription>
          Sarah is Wranngle&apos;s own lead-intake agent — not just a demo. Tell
          her about {tierName} and your situation in your own words; she asks
          everything this form asks and more, then routes the summary to the
          team. Prefer to type? Skip straight to the form.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <DialogClose asChild>
          <button
            type="button"
            onClick={() => {
              globalThis.setTimeout(() => {
                goTalkToSarah();
              }, 150);
            }}
            className="h-12 px-4 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md shadow-lg hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
          >
            <Sparkles size={14} className="sarah-glimmer" aria-hidden />
            Scope it with Sarah
          </button>
        </DialogClose>
        <button
          type="button"
          onClick={onContinue}
          className="h-12 px-4 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all inline-flex items-center justify-center gap-2"
        >
          Continue to form
          <ArrowRight size={14} aria-hidden />
        </button>
      </div>
      <p className="mt-3 text-[11px] opacity-55 leading-relaxed">
        Sarah announces she&apos;s an AI agent at the start of the call. Mic
        permissions required; no signup.
      </p>
    </div>
  );
}

function SaasIntakeForm({
  currentPackage,
  register,
  handleSubmit,
  onSubmit,
  isPending,
}: IntakeFormFieldsProps) {
  const offering = getOfferingById(currentPackage);
  const tierName = offering?.name ?? 'gtm_ops Platform';

  return (
    <>
      <DialogHeader>
        <DialogTitle className="brand-font text-2xl">
          Request workspace setup
        </DialogTitle>
        <DialogDescription>
          {`Email + company is all we need. We handle ${tierName} workspace setup from there.`}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
          <Label htmlFor="notes">Additional notes (Optional)</Label>
          <Textarea
            id="notes"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit min-h-[80px]"
            {...register('notes')}
            placeholder="Use case, integrations, compliance needs, timeline..."
          />
        </div>
        <input type="hidden" {...register('package')} value={currentPackage} />
        <LegalNotice />
        <Button
          type="submit"
          className="w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90"
          disabled={isPending}
        >
          {isPending ? 'Submitting...' : `Request ${tierName} setup`}
        </Button>
      </form>
    </>
  );
}

function PackageFollowup({
  currentPackage,
  setCurrentPackage,
}: {
  currentPackage: string;
  setCurrentPackage: Dispatch<SetStateAction<string>>;
}) {
  if (currentPackage === 'basic') {
    return (
      <UpgradeCard
        title="Optional Upgrade"
        body={
          <>
            Omni Intake answers and dispatches. <b>Internal AI</b> resolves —
            trained on your knowledge, acting in your systems.
          </>
        }
        buttonLabel="Upgrade to Internal AI (+$250/mo)"
        onClick={() => {
          setCurrentPackage('premium');
        }}
      />
    );
  }

  if (currentPackage === 'premium') {
    return (
      <UpgradeCard
        title="Optional Upgrade"
        body={
          <>
            Internal AI resolves conversations. <b>gtm_ops Platform</b> turns
            them into pipeline: enrichment, branded proposals, and run logs.
          </>
        }
        buttonLabel="Go Platform (+$400/mo)"
        onClick={() => {
          setCurrentPackage('gtm-ops-pro');
        }}
      />
    );
  }

  if (currentPackage === 'gtm-ops-pro') {
    return (
      <SelectedPackageCard
        title="gtm_ops Platform Selected"
        body="Everything in Internal AI plus enrichment, branded proposals, run logs, SSO, and team workspaces."
      />
    );
  }

  return null;
}

function UpgradeCard({
  title,
  body,
  buttonLabel,
  onClick,
}: {
  title: string;
  body: React.ReactNode;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-4 items-start">
      <Zap className="text-[var(--s500)] shrink-0" size={20} aria-hidden />
      <div>
        <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider mb-1">
          {title}
        </div>
        <p className="text-[11px] opacity-80 leading-relaxed mb-2">{body}</p>
        <button
          type="button"
          onClick={onClick}
          className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[var(--s500)] border border-[var(--s500)] px-3 py-1.5 rounded hover:bg-[var(--s500)] hover:text-white transition-all uppercase tracking-wide"
        >
          {buttonLabel} <ArrowRight size={10} />
        </button>
      </div>
    </div>
  );
}

function SelectedPackageCard({title, body}: {title: string; body: string}) {
  return (
    <div className="p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-4 items-center">
      <div className="w-5 h-5 rounded-full bg-[var(--s500)] flex items-center justify-center text-white shrink-0">
        <Check size={12} strokeWidth={4} aria-hidden />
      </div>
      <div>
        <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider">
          {title}
        </div>
        <p className="text-[11px] opacity-80 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function StandardIntakeForm({
  currentPackage,
  register,
  handleSubmit,
  onSubmit,
  isPending,
  setCurrentPackage,
}: IntakeFormFieldsProps & {
  setCurrentPackage: Dispatch<SetStateAction<string>>;
}) {
  const offering = getOfferingById(currentPackage);
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

      {isAgent && <AgentDemoSecondaryAction />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
            {...register('businessName', {required: true})}
            placeholder="Acme Operations"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="industry">Business Type / Use Case</Label>
          <Input
            id="industry"
            className="placeholder:opacity-40 border-l-4 border-l-[var(--s500)] bg-transparent text-inherit"
            {...register('industry', {required: true})}
            placeholder="Customer support / sales / operations / etc."
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
        <PackageFollowup
          currentPackage={currentPackage}
          setCurrentPackage={setCurrentPackage}
        />
        <input type="hidden" {...register('package')} value={currentPackage} />
        <LegalNotice />
        <Button
          type="submit"
          className="w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90"
          disabled={isPending}
        >
          {isPending ? 'Submitting...' : `Request ${offering?.name ?? 'setup'}`}
        </Button>
      </form>
    </>
  );
}

type IntakeFormProps = {
  selectedPackage: string;
  onSuccess?: () => void;
};

const IntakeForm = ({
  selectedPackage,
  onSuccess = noopOnSuccess,
}: IntakeFormProps) => {
  const [currentPackage, setCurrentPackage] = useState(selectedPackage);
  const {register, handleSubmit, reset, setValue} = useForm<IntakeFormData>({
    defaultValues: {package: currentPackage},
    shouldUseNativeValidation: true,
  });
  const {toast} = useToast();
  const [successData, setSuccessData] = useState<IntakeFormData | undefined>(
    undefined,
  );
  // Sarah pre-modal gate: shown as the first step before the form so users
  // can take a quick voice demo before committing intake time. Round-2
  // feedback F006 and F027 — applies to AI agent and gtm_ops flows.
  const [sarahGateOpen, setSarahGateOpen] = useState(true);

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

  const isSaas = isSaasPackage(currentPackage);

  if (sarahGateOpen) {
    const offering = getOfferingById(currentPackage);
    const tierName = offering?.name ?? 'what you need';
    return (
      <SarahPreModalGate
        tierName={tierName}
        onContinue={() => {
          setSarahGateOpen(false);
        }}
      />
    );
  }

  const formProps = {
    currentPackage,
    register,
    handleSubmit,
    isPending: mutation.isPending,
    onSubmit(data: IntakeFormData) {
      mutation.mutate(data);
    },
  };

  if (isSaas) {
    return <SaasIntakeForm {...formProps} />;
  }

  return (
    <StandardIntakeForm {...formProps} setCurrentPackage={setCurrentPackage} />
  );
};

export default IntakeForm;
