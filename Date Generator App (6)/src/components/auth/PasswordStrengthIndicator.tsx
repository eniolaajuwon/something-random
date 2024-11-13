import { Check, X } from 'lucide-react';

interface Props {
  password: string;
}

export function PasswordStrengthIndicator({ password }: Props) {
  const requirements = [
    {
      text: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      text: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      text: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      text: 'Contains number',
      met: /\d/.test(password),
    },
    {
      text: 'Contains special character',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const strength = requirements.filter(req => req.met).length;
  const strengthPercentage = (strength / requirements.length) * 100;

  return (
    <div className="space-y-2 mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${strengthPercentage}%`,
            backgroundColor: strengthPercentage <= 20 ? '#ef4444' :
                           strengthPercentage <= 40 ? '#f97316' :
                           strengthPercentage <= 60 ? '#eab308' :
                           strengthPercentage <= 80 ? '#84cc16' :
                                                    '#22c55e'
          }}
        />
      </div>
      <ul className="text-xs space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-red-500" />
            )}
            <span className={req.met ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}