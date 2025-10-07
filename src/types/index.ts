export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface AccordionItemProps {
  title: string;
  content: string;
  isOpen?: boolean;
  onClick?: () => void;
}

export interface ServiceProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export interface TestimonialProps {
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}