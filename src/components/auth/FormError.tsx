import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  id: string;
  message: string;
}

// Inline error announced by screen readers; link inputs to it with aria-describedby={id}
const FormError = ({ id, message }: FormErrorProps) => {
  return (
    <div
      id={id}
      role="alert"
      className="flex items-start gap-2.5 rounded-[10px] border border-red-400/35 bg-red-500/10 px-3.5 py-3 text-[13px] leading-snug text-red-200"
    >
      <AlertCircle className="mt-px h-[18px] w-[18px] shrink-0 text-red-400" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;
